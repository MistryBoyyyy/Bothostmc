// Restores Vexaro_MC guild config (was accidentally wiped by old check script)
import 'dotenv/config';
import { Client, GatewayIntentBits } from 'discord.js';
import { setGuildConfig, getGuildConfig } from './src/store.js';

const GUILD_ID = '1539606347513860186';

const client = new Client({ intents: [GatewayIntentBits.Guilds] });
await client.login(process.env.DISCORD_TOKEN);
const guild = await client.guilds.fetch(GUILD_ID);

const roles = await guild.roles.fetch();
const channels = await guild.channels.fetch();
const playerRole = [...roles.values()].find((r) => r.name === '🥉┃Player');
const modlog = [...channels.values()].find((c) => c.name === '🛡️┃mod-logs');
console.log('found role:', playerRole?.name, '| modlog:', modlog?.name);

const cfg = setGuildConfig(GUILD_ID, {
  welcomeChannel: '1539608011780268082',
  autorole: playerRole?.id ?? null,
  ticketCategory: '1539608004796743751',
  modlog: modlog?.id ?? null,
});
console.log('config restored:', JSON.stringify(cfg));

await client.destroy();
