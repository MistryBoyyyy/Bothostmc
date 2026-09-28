// Uploads animated GIFs + transparent PNGs.
// NOTE: Discord CDN never invalidates patched emoji assets, so we DELETE + recreate
// to get fresh IDs / fresh CDN files.
import 'dotenv/config';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { REST, Routes } from 'discord.js';

const GUILD_ID = '1539606347513860186';
const NAMES = ['gem', 'crown', 'sparkle', 'trophy', 'gift', 'fire', 'ticket', 'lock', 'hourglass', 'pick'];

const rest = new REST().setToken(process.env.DISCORD_TOKEN);
const existing = await rest.get(Routes.guildEmojis(GUILD_ID));
const have = new Map(existing.map((e) => [e.name, e]));

const out = existsSync(path.join('data', 'premium-emojis.json'))
  ? JSON.parse(readFileSync(path.join('data', 'premium-emojis.json'), 'utf8'))
  : {};

async function recreate(name, file, mime) {
  if (have.has(name)) {
    await rest.delete(Routes.guildEmoji(GUILD_ID, have.get(name).id)).catch(() => {});
    await new Promise((r) => setTimeout(r, 300));
  }
  const b64 = readFileSync(file).toString('base64');
  const emoji = await rest.post(Routes.guildEmojis(GUILD_ID), { body: { name, image: `data:${mime};base64,${b64}` } });
  await new Promise((r) => setTimeout(r, 400));
  return emoji;
}

for (const name of NAMES) {
  const animatedEmoji = await recreate(`p${name}`, path.join('emojis', `${name}.gif`), 'image/gif');
  const pngEmoji = await recreate(`s_${name}`, path.join('emojis', `${name}.png`), 'image/png');
  out[name] = { id: animatedEmoji.id, animated: animatedEmoji.animated, name: `p${name}`, pngId: pngEmoji.id };
  console.log(`recreated :p${name}: ${animatedEmoji.id} | :s_${name}: ${pngEmoji.id}`);
}

writeFileSync(path.join('data', 'premium-emojis.json'), JSON.stringify(out, null, 2));
console.log('saved premium-emojis.json');

// verify CDN serves the fresh transparent file
const buf = await fetch(`https://cdn.discordapp.com/emojis/${out.gem.id}.gif`).then((r) => r.arrayBuffer());
const local = readFileSync('emojis/gem.gif');
console.log('CDN bytes:', buf.byteLength, '| local bytes:', local.length, '| match:', Buffer.from(buf).equals(local));
