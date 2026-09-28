import 'dotenv/config';
import { readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  Client, Collection, Events, GatewayIntentBits, Partials, ActivityType, PermissionFlagsBits, Colors,
} from 'discord.js';
import { handleMessage, handleMemberAdd } from './antispam.js';
import { handleAfkMessages } from './afk.js';
import { handleAutomod, applyImageLock, recentAutoDeletes } from './automod.js';
import { logToModlog, fmtUser } from './util.js';
import { onChannelDelete, onRoleDelete, onGuildBanAdd } from './antinuke.js';
import { recordMessage, getGuildConfig } from './store.js';
import { startTimerChecker } from './timers.js';
import { buildIpEmbed } from './ipembed.js';
import {
  cacheAllInvites, onInviteCreate, onInviteDelete, findInviter, handleMemberRemove,
} from './invites.js';
import { handleWelcome, handleGoodbye } from './welcome.js';
import { startGiveawayChecker } from './giveaways.js';
import { BTN_OPEN, BTN_CLOSE, handleOpenButton, handleCloseButton } from './tickets.js';
import { startWeb } from './web.js';
import { fillGuild } from './emojiAutofill.js';
import fs from 'fs';

const ACT_TYPES = { playing: 'Playing', streaming: 'Streaming', listening: 'Listening', watching: 'Watching', competing: 'Competing' };
function applySavedProfile(c) {
  try {
    const p = JSON.parse(fs.readFileSync('./data/botprofile.json', 'utf8'));
    if (p?.statusText) {
      c.user.setPresence({
        status: p.presence || 'online',
        activities: [{ name: p.statusText, type: ACT_TYPES[p.statusType] || 'Playing', url: p.statusType === 'streaming' ? 'https://twitch.tv/rizokmc' : undefined }]
      });
    }
  } catch {}
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));

if (!process.env.DISCORD_TOKEN) {
  console.error('❌ DISCORD_TOKEN is not set. Copy .env.example to .env and paste your bot token.');
  process.exit(1);
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildModeration,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildInvites,
    GatewayIntentBits.MessageContent,
  ],
  partials: [Partials.Channel, Partials.Message, Partials.User, Partials.Reaction, Partials.GuildMember],
});

// ---- Load commands ----
client.commands = new Collection();
const commandsPath = path.join(__dirname, 'commands');
for (const file of readdirSync(commandsPath).filter((f) => f.endsWith('.js'))) {
  const mod = await import(path.join(commandsPath, file));
  if (mod.data && mod.execute) client.commands.set(mod.data.name, mod);
}
console.log(`✅ Loaded ${client.commands.size} commands.`);

// ---- Slash command handling ----
client.on(Events.InteractionCreate, async (interaction) => {
  try {
    if (interaction.isButton()) {
      if (interaction.customId === BTN_OPEN) return await handleOpenButton(interaction);
      if (interaction.customId === BTN_CLOSE) return await handleCloseButton(interaction);
      return;
    }

    if (!interaction.isChatInputCommand()) return;
    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    if (!interaction.inGuild()) {
      await interaction.reply({ content: '❌ These commands only work inside a server.', ephemeral: true });
      return;
    }
    await command.execute(interaction, client);
  } catch (err) {
    console.error(`Error in interaction:`, err);
    const payload = { content: '❌ Something went wrong.', ephemeral: true };
    if (interaction.replied || interaction.deferred) await interaction.followUp(payload).catch(() => {});
    else await interaction.reply(payload).catch(() => {});
  }
});

// ---- Auto-moderation + AFK + message tracking + IP auto-reply ----
client.on(Events.MessageCreate, (message) => {
  handleMessage(message).catch((err) => console.error('antispam error:', err));
  handleAfkMessages(message).catch((err) => console.error('afk error:', err));
  handleAutomod(message).catch((err) => console.error('automod error:', err));

  if (message.guild && !message.author.bot) {
    // chat IP auto-reply: type "ip" anywhere and get the IP card
    if (/^\s*(ip|ip\?|server ip|play\.rizokmc\.fun)\s*$/i.test(message.content)) {
      message.channel.send({ embeds: [buildIpEmbed(message.guild)] }).catch(() => {});
    }
    // message tracking: only count where @everyone can actually chat
    if (message.channel.permissionsFor(message.guild.id)?.has(PermissionFlagsBits.SendMessages)) {
      recordMessage(message.guild.id, message.author.id);
    }
  }
});

// ---- Full-activity modlog: deletes, edits, joins, leaves ----
client.on(Events.MessageDelete, (message) => {
  if (!message.guild || message.author?.bot || recentAutoDeletes.has(message.id)) return;
  logToModlog(message.guild, {
    title: '🗑️ Message deleted',
    description:
      `**User:** ${fmtUser(message.author)}\n**Channel:** ${message.channel} (${message.channel.name})\n` +
      `**Content:** \`${(message.content || '(embed/attachment)').slice(0, 500)}\`\n` +
      (message.attachments?.size ? `**Attachments:** ${message.attachments.size}` : ''),
    color: Colors.Orange,
  }).catch(() => {});
});

client.on(Events.MessageBulkDelete, (messages, channel) => {
  if (!channel?.guild) return;
  const sample = [...messages.values()].filter((m) => m.author && !m.author.bot)
    .slice(0, 10).map((m) => `• ${m.author?.username ?? '?'}: \`${(m.content || '(media)').slice(0, 80)}\``).join('\n');
  logToModlog(channel.guild, {
    title: '🗑️ Bulk messages deleted',
    description: `**Channel:** ${channel} (${channel.name})\n**Count:** ${messages.size}\n${sample || ''}`,
    color: Colors.Orange,
  }).catch(() => {});
});

client.on(Events.MessageUpdate, (oldM, newM) => {
  if (!oldM.guild || oldM.author?.bot || oldM.content === newM.content) return;
  logToModlog(oldM.guild, {
    title: '✏️ Message edited',
    description:
      `**User:** ${fmtUser(oldM.author)}\n**Channel:** ${oldM.channel}\n` +
      `**Before:** \`${(oldM.content || '').slice(0, 250)}\`\n**After:** \`${(newM.content || '').slice(0, 250)}\``,
    color: Colors.Yellow,
  }).catch(() => {});
});

client.on(Events.GuildMemberAdd, (m) => {
  logToModlog(m.guild, {
    title: '📥 Member joined',
    description: `**User:** ${fmtUser(m.user)}\n**Account created:** <t:${Math.floor(m.user.createdTimestamp / 1000)}:R>\n**Members now:** ${m.guild.memberCount}`,
    color: Colors.Green,
  }).catch(() => {});
});

client.on(Events.GuildMemberRemove, (m) => {
  logToModlog(m.guild, {
    title: '📤 Member left/kicked',
    description: `**User:** ${fmtUser(m.user)}\n**Members now:** ${m.guild.memberCount}`,
    color: Colors.Red,
  }).catch(() => {});
});

// ---- New channel: keep images-off + modlog lock applied ----
client.on(Events.ChannelCreate, (channel) => {
  if (channel.guild) applyImageLock(channel.guild).catch((e) => console.error('images-off error:', e));
});

// ---- Anti-nuke protection ----
client.on(Events.ChannelDelete, (channel) => {
  onChannelDelete(channel).catch((e) => console.error('antinuke error:', e));
});
client.on(Events.GuildRoleDelete, (role) => {
  onRoleDelete(role).catch((e) => console.error('antinuke error:', e));
});
client.on(Events.GuildBanAdd, (ban) => {
  onGuildBanAdd(ban).catch((e) => console.error('antinuke error:', e));
});

// ---- Join: raid alert + invite tracking + welcome + autorole ----
client.on(Events.GuildMemberAdd, (member) => {
  (async () => {
    await handleMemberAdd(member).catch((err) => console.error('raid detection error:', err));
    const inviterInfo = await findInviter(member).catch((err) => {
      console.error('invite tracking error:', err);
      return null;
    });
    await handleWelcome(member, inviterInfo).catch((err) => console.error('welcome error:', err));
  })();
});

// ---- Leave: goodbye + invite tracking ----
client.on(Events.GuildMemberRemove, (member) => {
  (async () => {
    await handleMemberRemove(member).catch(() => {});
    await handleGoodbye(member).catch(() => {});
  })();
});

// ---- Invite cache sync ----
client.on(Events.InviteCreate, onInviteCreate);
client.on(Events.InviteDelete, onInviteDelete);

// ---- Ready ----
client.once(Events.ClientReady, async (c) => {
  c.user.setPresence({
    activities: [{ name: '⛏️ play.rizokmc.fun', type: ActivityType.Playing }],
    status: 'online',
  });
  applySavedProfile(c);          // website-set name/status wins over default
  setInterval(() => applySavedProfile(c), 10 * 60 * 1000); // status hamesha live rahe
  await cacheAllInvites(c);
  startWeb(c);
  for (const g of c.guilds.cache.values()) {
    const n = await applyImageLock(g).catch((e) => { console.error('images-off error:', e); return 0; });
    console.log(`🖼️ [images-off] locked ${n} channels in ${g.name}`);
    if (g.id !== '1539606347513860186') fillGuild(g).catch(() => {}); // extra emoji-server → auto 50 MC emojis
  }
  startGiveawayChecker(c);
  startTimerChecker(c);
  console.log(`🤖 Logged in as ${c.user.tag}`);
  console.log(`🔗 Invite link: https://discord.com/oauth2/authorize?client_id=${c.application.id}&permissions=8&scope=bot%20applications.commands`);
});

client.on('guildCreate', (g) => { console.log(`[autofill] bot joined ${g.name} — filling emoji slots`); fillGuild(g).catch(() => {}); });
client.on(Events.Error, (err) => console.error('Client error:', err));
process.on('unhandledRejection', (err) => console.error('Unhandled rejection:', err));

await client.login(process.env.DISCORD_TOKEN);
