// ══════════════════════════════════════════════════════════════
//  EMOJI AUTO-FILLER — fills the server to the max emoji slots
//  (50 animated + 50 static). Retries patiently through 429s.
// ══════════════════════════════════════════════════════════════
import fs from 'fs';

const GUILD = '1539606347513860186';
const KNOWN = new Set(['gem','crown','sparkle','trophy','gift','fire','ticket','lock','hourglass','pick','music','rmc','sword','creeper','tnt','heart','coin','star','grass','potion','bolt'].map(k => 'p' + k));

async function api(path, opts = {}) {
  const r = await fetch('https://discord.com/api/v10' + path, {
    ...opts,
    headers: { Authorization: 'Bot ' + process.env.DISCORD_TOKEN, 'Content-Type': 'application/json', ...(opts.headers || {}) }
  });
  const body = r.headers.get('content-type')?.includes('json') ? await r.json() : null;
  return { status: r.status, body };
}

export async function fillOnce() {
  const list = (await api(`/guilds/${GUILD}/emojis`)).body;
  if (!Array.isArray(list)) return false;
  const names = new Set(list.map(e => e.name));
  const animRoom = 50 - list.filter(e => e.animated).length;
  const statRoom = 50 - list.filter(e => !e.animated).length;
  const vaultKeys = new Set(list.filter(e => e.animated && !KNOWN.has(e.name)).map(e => e.name.slice(1)));
  let did = 0;

  console.log(`[filler] live ${list.filter(e => e.animated).length}a/${list.length - list.filter(e => e.animated).length}s — room: ${animRoom} anim, ${statRoom} static`);
  const animFiles = ['emojis2', 'emojis3', 'emojis4'].flatMap((dir) => {
    try { return fs.readdirSync(`./assets/${dir}`).filter((f) => f.endsWith('.gif')).map((f) => ({ k: f.replace('.gif', ''), p: `./assets/${dir}/${f}` })); } catch { return []; }
  });
  const animCands = animFiles.filter(({ k }) => !names.has('p' + k));
  for (const { k, p } of animCands.slice(0, Math.max(0, animRoom))) {
    const b64 = fs.readFileSync(p).toString('base64');
    const res = await api(`/guilds/${GUILD}/emojis`, { method: 'POST', body: JSON.stringify({ name: 'p' + k, image: 'data:image/gif;base64,' + b64 }) });
    if (res.status === 429) { console.log('[filler] rate limited', Math.round(res.body?.retry_after ?? 0) + 's'); return did > 0; }
    if (res.status >= 200 && res.status < 300) did++;
    else console.log('[filler] anim upload', k, 'status', res.status, JSON.stringify(res.body).slice(0, 120));
    await new Promise(r => setTimeout(r, 1500));
  }
  const statCands = fs.readdirSync('./assets/stills').map(f => f.replace('.png', '')).filter(k => !names.has('s' + k) && !vaultKeys.has(k));
  for (const k of statCands.slice(0, Math.max(0, statRoom))) {
    const b64 = fs.readFileSync(`./assets/stills/${k}.png`).toString('base64');
    const res = await api(`/guilds/${GUILD}/emojis`, { method: 'POST', body: JSON.stringify({ name: 's' + k, image: 'data:image/png;base64,' + b64 }) });
    if (res.status === 429) { console.log('[filler] rate limited', Math.round(res.body?.retry_after ?? 0) + 's'); return did > 0; }
    if (res.status >= 200 && res.status < 300) did++;
    else console.log('[filler] static upload', k, 'status', res.status, JSON.stringify(res.body).slice(0, 120));
    await new Promise(r => setTimeout(r, 1500));
  }
  return did > 0;
}

export function startFiller() {
  const run = async () => {
    try {
      const more = await fillOnce();
      console.log(more ? '[filler] uploaded a batch, will check again' : '[filler] slots full or nothing to do');
    } catch (e) { /* transient */ }
    setTimeout(run, 5 * 60 * 1000);
  };
  setTimeout(run, 30 * 1000); // first pass 30s after boot
}
