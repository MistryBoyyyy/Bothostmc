// Resets welcome + invites channels, locks them for players, posts demo messages
import 'dotenv/config';
import {
  Client, GatewayIntentBits, EmbedBuilder, Colors, PermissionFlagsBits,
} from 'discord.js';

const GUILD_ID = '1539606347513860186';
const WELCOME_CHANNEL = '1539608011780268082'; // 🍷・ᴡᴇʟᴄᴏᴍᴇ
const INVITES_CHANNEL = '1539608012354879550'; // 🍭・ɪɴᴠɪᴛᴇꜱ

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers] });
await client.login(process.env.DISCORD_TOKEN);
const guild = await client.guilds.fetch(GUILD_ID);

// ---------- 1) Purge messages ----------
async function purge(channel) {
  let total = 0;
  for (;;) {
    const msgs = await channel.messages.fetch({ limit: 100 });
    if (!msgs.size) break;
    const fresh = msgs.filter((m) => Date.now() - m.createdTimestamp < 14 * 86400_000);
    if (fresh.size) {
      const deleted = await channel.bulkDelete(fresh, true);
      total += deleted.size;
    }
    // older than 14 days must be deleted one by one
    const old = msgs.filter((m) => Date.now() - m.createdTimestamp >= 14 * 86400_000);
    for (const [, m] of old) {
      await m.delete().catch(() => {});
      total++;
    }
    if (msgs.size < 100) break;
  }
  console.log(`  purged ${total} message(s) in #${channel.name}`);
}

// ---------- 2) Lock for players ----------
async function lockForPlayers(channel) {
  await channel.permissionOverwrites.edit(GUILD_ID, {
    ViewChannel: true,
    ReadMessageHistory: true,
    SendMessages: false,
    AddReactions: false,
    CreatePublicThreads: false,
    CreatePrivateThreads: false,
    SendMessagesInThreads: false,
  });
  // make sure the bot can still send
  await channel.permissionOverwrites.edit(client.user.id, {
    ViewChannel: true,
    SendMessages: true,
    EmbedLinks: true,
    AttachFiles: true,
    ReadMessageHistory: true,
  });
  console.log(`  🔒 #${channel.name} locked for players`);
}

const welcome = await guild.channels.fetch(WELCOME_CHANNEL);
const invites = await guild.channels.fetch(INVITES_CHANNEL);

console.log('1) Purging...');
await purge(welcome);
await purge(invites);

console.log('2) Locking channels for players...');
await lockForPlayers(welcome);
await lockForPlayers(invites);

console.log('3) Posting demo messages...');

// ---------- Demo welcome message ----------
const demoWelcome = new EmbedBuilder()
  .setColor(Colors.Green)
  .setAuthor({ name: `Welcome to ${guild.name}!`, iconURL: guild.iconURL() ?? undefined })
  .setDescription(
    'Welcome <@Steve> to **Vexaro_MC**! 🎉\n' +
    'You are member **#128**.\n' +
    'Invited by @Notch (code `abc123`)'
  )
  .setThumbnail(client.user.displayAvatarURL({ size: 256 }))
  .addFields(
    { name: '👥 Total Members', value: '128', inline: true },
    { name: '📅 Account Created', value: '2 years ago', inline: true },
    { name: '📨 Invite', value: 'Invited by @Notch (code `abc123`)', inline: false }
  )
  .setFooter({ text: '🔎 DEMO — real welcome messages look exactly like this' })
  .setTimestamp();

await welcome.send({
  content: '**🍷 Welcome Channel** — jab bhi naya player join karega, aisa message aayega (with ping). Ye ek demo hai:',
  embeds: [demoWelcome],
});

// ---------- Demo invites message ----------
const demoInvites = new EmbedBuilder()
  .setColor(Colors.Gold)
  .setTitle('🍭 Invite Tracking — Kaise kaam karta hai?')
  .setDescription(
    'Har invite track hoti hai! Jab koi aapki invite se join karta hai:\n\n' +
    '📨 Welcome message mein dikhta hai: **"Invited by @You"**\n' +
    '🏆 Leaderboard mein aapka count badhta hai\n\n' +
    '**Commands:**\n' +
    '• `/invites` — apne invites dekho\n' +
    '• `/invite-leaderboard` — top 10 inviters'
  )
  .addFields({
    name: '🏆 Example Leaderboard',
    value: '🥇 @Notch — **42** invites\n🥈 @Jeb — **30** invites\n🥉 @Dinnerbone — **17** invites',
  })
  .setFooter({ text: '🔎 DEMO — tracking abhi se live hai, real counts tab dikhenge jab log join karenge' })
  .setTimestamp();

await invites.send({ embeds: [demoInvites] });

console.log('\n🎉 Reset + demo + lock complete!');
await client.destroy();
