// Resets welcome + giveaway channels and posts PREMIUM demo messages with animated emojis
import 'dotenv/config';
import { Client, GatewayIntentBits, EmbedBuilder, Colors } from 'discord.js';
import { createGiveaway } from './src/giveaways.js';
import { buildWelcomeEmbed } from './src/welcome.js';
import { saveGiveaways, getInviteLeaderboard } from './src/store.js';
import { ticketPanelEmbed, ticketPanelRow } from './src/tickets.js';
import E from './src/premium.js';

const GUILD_ID = '1539606347513860186';
const WELCOME_CHANNEL = '1539608011780268082'; // 🍷・ᴡᴇʟᴄᴏᴍᴇ
const GIVEAWAY_CHANNEL = '1539608021834010706'; // 🎁・ɢɪᴠᴇᴀᴀʏ
const INVITES_CHANNEL = '1539608012354879550'; // 🍭・ɴᴠɪᴛᴇꜱ
const INFO_CHANNEL = '1539608015068729384'; // 🍸・ɪɴꜰᴏʀᴍᴀᴛɪᴏɴꜱ
const TICKET_CHANNEL = '1539608038162432062'; // ticket channel

const client = new Client({ intents: [GatewayIntentBits.Guilds] });
await client.login(process.env.DISCORD_TOKEN);
const guild = await client.guilds.fetch(GUILD_ID);

// clear old giveaway records (old demo will be purged from channel)
saveGiveaways([]);

async function purge(channel) {
  let total = 0;
  for (;;) {
    const msgs = await channel.messages.fetch({ limit: 100 });
    if (!msgs.size) break;
    const deleted = await channel.bulkDelete(msgs, true);
    total += deleted.size;
    if (msgs.size < 100) break;
  }
  console.log(`purged ${total} in #${channel.name}`);
}

const welcome = await guild.channels.fetch(WELCOME_CHANNEL);
const giveaway = await guild.channels.fetch(GIVEAWAY_CHANNEL);
const invites = await guild.channels.fetch(INVITES_CHANNEL);
const info = await guild.channels.fetch(INFO_CHANNEL);
const ticket = await guild.channels.fetch(TICKET_CHANNEL);
await purge(welcome);
await purge(giveaway);
await purge(invites);
await purge(info);
await purge(ticket);

// ---- Premium welcome demo ----
await welcome.send({
  content: `# ${E.pcrown} WELCOME TO RIZOKMC ${E.pcrown}\n> *When a new player joins, they receive a PREMIUM animated message like this! (DEMO)*`,
  embeds: [
    buildWelcomeEmbed({
      userMention: '@Steve',
      avatarUrl: client.user.displayAvatarURL({ size: 256 }),
      serverName: guild.name,
      count: 128,
      inviterline: '@Notch (code `abc123`)',
      createdText: '2 years ago',
      demo: true,
      serverIp: 'play.rizokmc.fun',
    }),
  ],
});
console.log('premium welcome demo posted ✅');

// ---- Premium giveaway with animated 💎 gem reaction ----
await giveaway.send({ content: `# ${E.pgem} GIVEAWAY ZONE ${E.pfire}\n> *React & win!*` });
const msg = await createGiveaway({
  channel: giveaway,
  guildId: GUILD_ID,
  prize: 'Premium Rank — 1 Month (DEMO)',
  winners: 1,
  endTime: Date.now() + 24 * 60 * 60 * 1000,
  hostId: client.user.id,
  hostName: 'MC-Security',
  reaction: E.pgem,
});
console.log(`premium giveaway posted: ${msg.id}`);

// ---- Premium invites demo ----
const board = getInviteLeaderboard(GUILD_ID);
const MEDALS = ['🥇', '🥈', ''];
const invitesEmbed = new EmbedBuilder()
  .setColor(Colors.Green)
  .setAuthor({ name: 'I N V I T E   T R A C K I N G' })
  .setDescription(
    `${E.psparkle} ─────────────────────────────\n` +
    `${E.ptrophy}  **Every invite is tracked!** When someone joins\n` +
    `      with your invite, the welcome shows **"Invited by @You"**\n` +
    `${E.pgem}  **Commands:** \`/invites\` • \`/invite-leaderboard\`\n` +
    `${E.psparkle} ─────────────────────────────`
  );
if (E.banner_invites) invitesEmbed.setImage(E.banner_invites);
invitesEmbed.addFields({
  name: `${E.ptrophy} Top Inviters`,
  value: board.length
    ? board.map((e, i) => `${MEDALS[i] ?? `**${i + 1}.**`} <@${e.id}> — **${e.net}** invites`).join('\n')
    : '*No invites tracked yet — invite your friends and climb the board!*',
});
invitesEmbed.setFooter({ text: 'DEMO — tracking is live; real counts appear when members join' }).setTimestamp();
await invites.send({
  content: `# ${E.ptrophy} INVITE TRACKING\n> *Every invite counts — climb the leaderboard! (DEMO)*`,
  embeds: [invitesEmbed],
});
console.log('premium invites demo posted ✅');

// ---- Server info panel with IP ----
const infoEmbed = new EmbedBuilder()
  .setColor(Colors.Green)
  .setAuthor({ name: 'R I Z O K M C ・ O F F I C I A L ・ S E R V E R' })
  .setDescription(
    `${E.pgem} ─────────────────────────────\n` +
    `⛏️  **Server IP** ❯ \`play.rizokmc.fun\`\n` +
    `${E.pfire}  **Bedrock Port** ❯ \`25957\`\n` +
    `${E.pcrown}  **Owner** ❯ <@${guild.ownerId}>\n` +
    `${E.psparkle} ─────────────────────────────\n` +
    `**Quick Guide:**\n` +
    `${E.pcrown}  \`welcome\` — new members are greeted here\n` +
    `${E.ptrophy}  \`invites\` — invite tracking & leaderboard\n` +
    `${E.pgift}  \`giveaway\` — react & win\n` +
    `${E.pticket}  \`ticket\` — get help from staff\n` +
    `${E.ppick}  Copy the IP and join the server — enjoy!`
  )
  .setFooter({ text: 'RizokMC • Powered by RizokMC bot' })
  .setTimestamp();
if (E.banner_server) infoEmbed.setImage(E.banner_server);
await info.send({
  content: `# ${E.ppick} RIZOKMC — PLAY.RIZOKMC.FUN\n> *Copy the server IP and join us!*`,
  embeds: [infoEmbed],
});
console.log('server info panel posted ✅');

// ---- RizokMC Support ticket panel ----
await ticket.send({ embeds: [ticketPanelEmbed()], components: [ticketPanelRow()] });
console.log('RizokMC Support ticket panel posted ✅');

await client.destroy();
