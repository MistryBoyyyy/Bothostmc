// Uploads animated banner GIFs as guild emojis => PERMANENT CDN URLs (attachment URLs expire)
import 'dotenv/config';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { Client, GatewayIntentBits } from 'discord.js';

const GUILD_ID = '1539606347513860186';

const client = new Client({ intents: [GatewayIntentBits.Guilds] });
await client.login(process.env.DISCORD_TOKEN);
await new Promise((r) => client.once('clientReady', r));
const guild = await client.guilds.fetch(GUILD_ID);

const rest = client.rest;
const existing = await rest.get(`/guilds/${GUILD_ID}/emojis`);
const have = new Map(existing.map((e) => [e.name, e]));

const out = JSON.parse(readFileSync(path.join('data', 'premium-emojis.json'), 'utf8'));
out.banners = out.banners ?? {};

for (const name of ['welcome', 'giveaway', 'invites', 'server']) {
  const b64 = readFileSync(path.join('banners', `${name}.gif`)).toString('base64');
  const ename = `b_${name}`;
  // CDN never invalidates patched assets => delete + recreate for fresh URL
  if (have.has(ename)) {
    await rest.delete(`/guilds/${GUILD_ID}/emojis/${have.get(ename).id}`).catch(() => {});
    await new Promise((r) => setTimeout(r, 300));
  }
  const emoji = await rest.post(`/guilds/${GUILD_ID}/emojis`, { body: { name: ename, image: `data:image/gif;base64,${b64}` } });
  console.log(`uploaded banner :${ename}: ${emoji.id}`);
  out.banners[name] = `https://cdn.discordapp.com/emojis/${emoji.id}.gif`;
  await new Promise((r) => setTimeout(r, 400));
}

// cleanup temp assets channel (attachment URLs expire; emoji CDN is permanent)
const assets = guild.channels.cache.find((c) => c.name === '🎨┃bot-assets');
if (assets) await assets.delete('banners now hosted on emoji CDN').catch(() => {});

writeFileSync(path.join('data', 'premium-emojis.json'), JSON.stringify(out, null, 2));
console.log('saved permanent banner URLs');
await client.destroy();
