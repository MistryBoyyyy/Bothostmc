// One-time server setup for Vexaro_MC:
// 1) Creates MC-themed rank roles with proper hierarchy
// 2) Creates a #mod-logs channel under Staff category
// 3) Configures welcome channel, autorole, ticket category, modlog
// 4) Posts the ticket panel in the ticket channel
import 'dotenv/config';
import {
  Client, GatewayIntentBits, ChannelType, EmbedBuilder, Colors,
} from 'discord.js';
import { setGuildConfig } from './src/store.js';
import { ticketPanelEmbed, ticketPanelRow } from './src/tickets.js';

const GUILD_ID = '1539606347513860186';
const WELCOME_CHANNEL = '1539608011780268082'; // 🍷・ᴡᴇʟᴄᴏᴍᴇ
const TICKET_CHANNEL = '1539608038162432062'; // 🎟・ᴛɪᴄᴋᴇᴛ
const TICKETS_CATEGORY = '1539608004796743751'; // 𒁷─・─・Tickets
const STAFF_CATEGORY = '1539608009859137566'; // 𒁷─・─・S T A F F

const RANKS = [
  { name: '👑┃Owner', color: 0xFFD700, hoist: true },
  { name: '🛡️┃Admin', color: 0xE74C3C, hoist: true },
  { name: '⚔️┃Moderator', color: 0xE67E22, hoist: true },
  { name: '🛠️┃Helper', color: 0xF1C40F, hoist: true },
  { name: '💎┃VIP', color: 0x00E5FF, hoist: true },
  { name: '🥇┃MVP+', color: 0xFF69B4, hoist: false },
  { name: '🥈┃MVP', color: 0x3498DB, hoist: false },
  { name: '🥉┃Player', color: 0x2ECC71, hoist: false },
  { name: '🤖┃Bot', color: 0x95A5A6, hoist: true },
];

const client = new Client({ intents: [GatewayIntentBits.Guilds] });
await client.login(process.env.DISCORD_TOKEN);

const guild = await client.guilds.fetch(GUILD_ID);
console.log(`Setting up ${guild.name}...`);

// 1) Create ranks (skip existing)
const created = [];
for (const r of RANKS) {
  const existing = guild.roles.cache.find((x) => x.name === r.name);
  if (existing) {
    console.log(`  = role exists: ${r.name}`);
    created.push(existing);
    continue;
  }
  const role = await guild.roles.create({ name: r.name, color: r.color, hoist: r.hoist, reason: 'MC-Security rank setup' });
  console.log(`  + created role: ${r.name}`);
  created.push(role);
}

// Order them: Owner highest ... Bot lowest, as a block just above @everyone
// setPosition with relative:false places at absolute index; go from highest to lowest
for (let i = 0; i < created.length; i++) {
  const targetPos = created.length - i; // Owner gets highest number in block
  await created[i].setPosition(targetPos).catch((e) => console.log(`  ! position failed for ${created[i].name}: ${e.message}`));
}
console.log('  ranks ordered ✅');

const playerRole = created.find((r) => r.name === '🥉┃Player');

// 2) Create #mod-logs channel under Staff category (skip if exists)
let modlog = guild.channels.cache.find((c) => c.name === '🛡️┃mod-logs');
if (!modlog) {
  modlog = await guild.channels.create({
    name: '🛡️┃mod-logs',
    type: ChannelType.GuildText,
    parent: STAFF_CATEGORY,
    reason: 'MC-Security mod logs',
  });
  console.log(`  + created #${modlog.name}`);
} else {
  console.log('  = #🛡️┃mod-logs already exists');
}

// 3) Save config
setGuildConfig(GUILD_ID, {
  welcomeChannel: WELCOME_CHANNEL,
  autorole: playerRole ? playerRole.id : null,
  ticketCategory: TICKETS_CATEGORY,
  modlog: modlog.id,
});
console.log('  config saved ✅ (welcome, autorole=🥉┃Player, ticket category, modlog)');

// 4) Post ticket panel
const ticketChannel = await guild.channels.fetch(TICKET_CHANNEL);
await ticketChannel.send({ embeds: [ticketPanelEmbed()], components: [ticketPanelRow()] });
console.log(`  + ticket panel posted in ${ticketChannel.name} ✅`);

console.log('\n🎉 Setup complete!');
await client.destroy();
