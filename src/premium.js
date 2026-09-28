// Premium animated emoji references (uploaded to the server)
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const p = path.join(__dirname, '..', 'data', 'premium-emojis.json');

let raw = null;
if (existsSync(p)) {
  try { raw = JSON.parse(readFileSync(p, 'utf8')); } catch { raw = null; }
}

const E = { ready: !!raw };
for (const k of ['gem', 'crown', 'sparkle', 'trophy', 'gift', 'fire', 'ticket', 'lock', 'hourglass', 'pick', 'music', 'rmc', 'sword', 'creeper', 'tnt', 'heart', 'coin', 'star', 'grass', 'potion', 'bolt']) {
  const e = raw?.[k];
  E['p' + k] = e ? `<a:${e.name}:${e.id}>` : '';
  if (e) E['url_' + k] = `https://cdn.discordapp.com/emojis/${e.id}.gif?size=128`;
  if (e?.pngId) E['png_' + k] = `<:s_${k}:${e.pngId}>`;
}
E.banner_welcome = raw?.banners?.welcome ?? null;
E.banner_giveaway = raw?.banners?.giveaway ?? null;
E.banner_invites = raw?.banners?.invites ?? null;
E.banner_server = raw?.banners?.server ?? null;

// parse "<a:name:123>" or "123" or unicode emoji into the key used by reaction caches
export function reactionKey(emojiStr) {
  const m = (emojiStr ?? '').match(/<?a?:?[\w~]+:(\d{17,20})>?/);
  return m ? m[1] : emojiStr;
}

export default E;
