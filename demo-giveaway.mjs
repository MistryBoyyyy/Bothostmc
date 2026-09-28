// Resets giveaway channel, locks chat (reactions stay open), posts a premium demo giveaway
import 'dotenv/config';
import { Client, GatewayIntentBits } from 'discord.js';
import { createGiveaway } from './src/giveaways.js';

const GUILD_ID = '1539606347513860186';
const GIVEAWAY_CHANNEL = '1539608021834010706'; // 🎁・ɢɪᴠᴇᴀᴡᴀʏ

const client = new Client({ intents: [GatewayIntentBits.Guilds] });
await client.login(process.env.DISCORD_TOKEN);
const guild = await client.guilds.fetch(GUILD_ID);
const channel = await guild.channels.fetch(GIVEAWAY_CHANNEL);

// 1) Purge old messages
let total = 0;
for (;;) {
  const msgs = await channel.messages.fetch({ limit: 100 });
  if (!msgs.size) break;
  const deleted = await channel.bulkDelete(msgs, true);
  total += deleted.size;
  if (msgs.size < 100) break;
}
console.log(`1) purged ${total} message(s)`);

// 2) Lock chat but keep reactions open
await channel.permissionOverwrites.edit(GUILD_ID, {
  ViewChannel: true,
  ReadMessageHistory: true,
  SendMessages: false,
  AddReactions: true, // players MUST be able to react to enter
  CreatePublicThreads: false,
  CreatePrivateThreads: false,
  SendMessagesInThreads: false,
});
await channel.permissionOverwrites.edit(client.user.id, {
  ViewChannel: true,
  SendMessages: true,
  EmbedLinks: true,
  AddReactions: true,
  ReadMessageHistory: true,
});
console.log('2) channel locked for chat, reactions open ✅');

// 3) Premium demo giveaway — 1 day, 💎 reaction
const endTime = Date.now() + 24 * 60 * 60 * 1000;
const msg = await createGiveaway({
  channel,
  guildId: GUILD_ID,
  prize: '💎 Premium Rank — 1 Month (DEMO)',
  winners: 1,
  endTime,
  hostId: client.user.id,
  hostName: 'MC-Security',
  reaction: '💎',
});
console.log(`3) premium demo giveaway posted: ${msg.id}`);

await client.destroy();
