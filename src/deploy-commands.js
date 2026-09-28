// Registers all slash commands with Discord (global, or per-guild if GUILD_ID is set)
import 'dotenv/config';
import { readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { REST, Routes } from 'discord.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

if (!process.env.DISCORD_TOKEN) {
  console.error('❌ DISCORD_TOKEN is not set.');
  process.exit(1);
}

const commandsPath = path.join(__dirname, 'commands');
const commands = [];
for (const file of readdirSync(commandsPath).filter((f) => f.endsWith('.js'))) {
  const mod = await import(path.join(commandsPath, file));
  if (mod.data) commands.push(mod.data.toJSON());
}

const rest = new REST().setToken(process.env.DISCORD_TOKEN);
const me = await rest.get(Routes.user());
console.log(`Logged in as ${me.username} (${me.id})`);

if (process.env.GUILD_ID) {
  await rest.put(Routes.applicationGuildCommands(me.id, process.env.GUILD_ID), { body: commands });
  console.log(`✅ Registered ${commands.length} commands in guild ${process.env.GUILD_ID} (instant).`);
} else {
  await rest.put(Routes.applicationCommands(me.id), { body: commands });
  console.log(`✅ Registered ${commands.length} global commands (may take up to 1 hour to appear everywhere).`);
}

console.log(`🔗 Invite: https://discord.com/oauth2/authorize?client_id=${me.id}&permissions=8&scope=bot%20applications.commands`);
