// ══════════════════════════════════════════════════════════════
//  EMOJI AUTO-FILLER v2 — bot jis bhi (extra) server me join kare,
//  uske khali animated slots (50/server) famous Minecraft animated
//  emojis se bhar deta hai. Wo emojis phir main server ke messages
//  me bhi INLINE emoji bankar dikhte hain (Discord ka rule: bot apne
//  kisi bhi server ka emoji kahin bhi use kar sakta hai).
// ══════════════════════════════════════════════════════════════
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PICK_DIR = path.join(__dirname, '..', 'assets', 'mcpremium');
const OUT = path.join(__dirname, '..', 'data', 'guild-emojis.json');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function readOut() {
  try { return JSON.parse(fs.readFileSync(OUT, 'utf8')); } catch { return []; }
}

export async function fillGuild(g) {
  try {
    const all = await g.emojis.fetch();
    const animCount = all.filter((e) => e.animated).size;
    let slots = 50 - animCount;
    if (slots <= 0) { console.log(`[autofill] ${g.name}: animated slots full (${animCount}/50) — nothing to do`); return 0; }
    const have = new Set(all.map((e) => e.name));
    const files = fs.readdirSync(PICK_DIR).filter((f) => f.endsWith('.gif')).sort();
    const out = readOut();
    const seen = new Set(out.filter((o) => o.guild === g.id).map((o) => o.name));
    let n = 0;
    for (const f of files) {
      if (slots <= 0) break;
      const name = f.slice(0, -4).slice(0, 32);
      if (have.has(name) || seen.has(name)) continue;
      try {
        const e = await g.emojis.create({ attachment: fs.readFileSync(path.join(PICK_DIR, f)), name });
        out.push({ key: `${name}_${g.id.slice(-4)}`, name: e.name, id: e.id, guild: g.id });
        seen.add(e.name);
        fs.writeFileSync(OUT, JSON.stringify(out, null, 1));
        n++; slots--;
        console.log(`[autofill] ${g.name}: +${e.name}`);
        await sleep(1500);
      } catch (err) {
        console.log('[autofill] stopping:', String(err.message || err).slice(0, 100));
        break; // quota full ya rate-limit — agle startup/join pe phir try hoga
      }
    }
    if (n) console.log(`[autofill] ✅ ${g.name}: ${n} MC emojis uploaded`);
    return n;
  } catch (err) {
    console.log('[autofill] error:', String(err.message || err).slice(0, 100));
    return 0;
  }
}
