// Renames the bot + Discord server to RizokMC
import 'dotenv/config';
import { REST, Routes } from 'discord.js';

const GUILD_ID = '1539606347513860186';
const rest = new REST().setToken(process.env.DISCORD_TOKEN);

const me = await rest.patch(Routes.user(), { body: { username: 'RizokMC' } });
console.log('bot renamed to:', me.username);

const guild = await rest.patch(Routes.guild(GUILD_ID), { body: { name: 'RizokMC' } });
console.log('server renamed to:', guild.name);
