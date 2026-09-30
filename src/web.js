// RizokMC — premium mobile-first web dashboard (Discord OAuth + full control)
import express from 'express';
import crypto from 'node:crypto';
import { readFileSync, writeFileSync, watchFile } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { EmbedBuilder, Colors } from 'discord.js';
import { getGuildConfig, setGuildConfig } from './store.js';
import { musicSession, skip, pause, resume, stopAll, searchTracks, playInChannel } from './music.js';
import { SOUNDS, playSound } from './soundboard.js';
import E from './premium.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const GUILD_ID = process.env.GUILD_ID || '1539606347513860186';
const CLIENT_ID = process.env.DISCORD_CLIENT_ID || '1553331246744993832';
const SECRET = process.env.DISCORD_CLIENT_SECRET || '';
const emo = JSON.parse(readFileSync(path.join(__dirname, '..', 'data', 'premium-emojis.json'), 'utf8'));

const ANIM_EMOJIS = [
  ...Object.entries(emo)
    .filter(([k, v]) => v?.animated && k !== 'banners')
    .map(([k, v]) => ({ key: k, name: v.name, id: v.id, url: `https://cdn.discordapp.com/emojis/${v.id}.gif?size=64` })),
  ...(emo.vault ?? []).map((v) => ({ key: v.key, name: v.name, id: v.id, url: v.url })),
];
// extra emoji servers (bot jitne servers me hai, unke emojis bhi inline use hote hain)
const GUILD_EMO_FILE = path.join(__dirname, '..', 'data', 'guild-emojis.json');
const EXTERNAL_EMO_FILE = path.join(__dirname, '..', 'data', 'external-emojis.json');
function loadGuildEmojis() {
  try {
    const arr = JSON.parse(readFileSync(GUILD_EMO_FILE, 'utf8'));
    ANIM_EMOJIS.length = 0;
    ANIM_EMOJIS.push(...Object.entries(emo).filter(([k, v]) => v?.animated && k !== 'banners').map(([k, v]) => ({ key: k, name: v.name, id: v.id, url: `https://cdn.discordapp.com/emojis/${v.id}.gif?size=64` })));
    ANIM_EMOJIS.push(...(emo.vault ?? []).map((v) => ({ key: v.key, name: v.name, id: v.id, url: v.url })));
    ANIM_EMOJIS.push(...arr.map((v) => ({ key: v.key, name: v.name, id: v.id, url: `https://cdn.discordapp.com/emojis/${v.id}.gif?size=64` })));
  } catch {}
  try {
    const ext = JSON.parse(readFileSync(EXTERNAL_EMO_FILE, 'utf8'));
    ANIM_EMOJIS.push(...ext.map((v) => ({ key: v.key, name: v.name, id: v.id, url: `https://cdn.discordapp.com/emojis/${v.id}.gif?size=64` })));
  } catch {}
}
loadGuildEmojis();
try { watchFile(GUILD_EMO_FILE, { interval: 4000 }, loadGuildEmojis); } catch {}
const em = (k) => ANIM_EMOJIS.find((e) => e.key === k)?.url ?? '';
const CORE_KEYS = new Set(['gem', 'crown', 'sparkle', 'trophy', 'gift', 'fire', 'ticket', 'lock', 'hourglass', 'pick', 'music', 'rmc', 'sword', 'creeper', 'tnt', 'heart', 'coin', 'star', 'grass', 'potion', 'bolt']);
const catOf = (k) => (CORE_KEYS.has(k) ? 'core' : k.startsWith('gem_') ? 'gems' : k.startsWith('ingot_') || k.startsWith('lump') || k.startsWith('ore_') ? 'ingots'
  : k.startsWith('face_') ? 'faces' : k.startsWith('food_') ? 'food' : k.startsWith('item_') || k.startsWith('tool_') ? 'items'
    : k.startsWith('nat_') ? 'nature' : k.startsWith('misc_') ? 'misc' : k.startsWith('mob_') ? 'mobs'
      : k.startsWith('st_') ? 'status' : k.startsWith('party_') ? 'party' : k.startsWith('gest_') ? 'gestures'
        : k.startsWith('rank_') ? 'ranks' : k.startsWith('b_') ? 'banners' : /arrow/.test(k) ? 'arrows' : /block/.test(k) ? 'blocks'
          : /creeper|enderman|tnt|minecart|obsidian|redstone|nether|wither|ghast|blaze|steve|villager|pickaxe|diamond|emerald|bedrock|deepslate|minecraft|ender|slime|zombie|skeleton|portal/.test(k) ? 'mc'
          : /maint|warn|construct|wrench|hammer|repair|toolkit|builder|caution|danger|gear|cog|drill|screw/.test(k) ? 'maint' : k.startsWith('x_') ? 'extra' : 'more');

// ---------- bot profile persistence ----------
const PROFILE_FILE = path.join(__dirname, '..', 'data', 'botprofile.json');
function readProfile() { try { return JSON.parse(readFileSync(PROFILE_FILE, 'utf8')); } catch { return {}; } }
function writeProfile(p) { writeFileSync(PROFILE_FILE, JSON.stringify(p, null, 2)); }
const ACT_TYPES = { playing: 'Playing', streaming: 'Streaming', listening: 'Listening', watching: 'Watching', competing: 'Competing' };
function applyPresence(p) {
  if (!client?.user) return;
  client.user.setPresence({
    status: p.presence || 'online',
    activities: [{ name: p.statusText || '⛏️ play.rizokmc.fun', type: ACT_TYPES[p.statusType] || 'Playing', url: p.statusType === 'streaming' ? 'https://twitch.tv/rizokmc' : undefined }],
  });
}

let client = null;
const app = express();
app.use(express.json());
app.use('/assets', express.static(path.join(__dirname, '..', 'assets')));

// ---------- session ----------
const hmac = (v) => crypto.createHmac('sha256', process.env.DISCORD_TOKEN || 'x').update(v).digest('hex');
const makeSession = (res, id) => res.setHeader('Set-Cookie', `rmc=${id}.${hmac(id)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800`);
function getSession(req) {
  const c = (req.headers.cookie ?? '').split(';').map((s) => s.trim()).find((s) => s.startsWith('rmc='));
  if (!c) return null;
  const [uid, sig] = c.slice(4).split('.');
  return uid && hmac(uid) === sig ? uid : null;
}
const base = (req) => process.env.BASE_URL || `https://${req.headers.host}`;
const redirectUri = (req) => `${base(req)}/auth/callback`;

async function guild() { return client.guilds.cache.get(GUILD_ID) ?? (await client.guilds.fetch(GUILD_ID)); }
async function memberOf(id) { const g = await guild(); return g.members.cache.get(id) ?? (await g.members.fetch(id).catch(() => null)); }
// ═══ ONLY OWNERS can access the dashboard ═══
const OWNERS = new Set(['914802269009113128', '1027748201236807762']); // spacygaming, vexaro_mc
const isOwner = (id) => OWNERS.has(String(id));
function isStaffMember(m) {
  if (!m) return false;
  if (isOwner(m.id)) return true;
  if (m.permissions.has('Administrator') || m.permissions.has('ManageMessages')) return true;
  const cfg = getGuildConfig(GUILD_ID);
  return m.roles.cache.some((r) => (cfg.ticketStaffRoles ?? []).includes(r.id));
}

// ---------- auth ----------
app.get('/auth', (req, res) => {
  if (!SECRET) return res.status(500).send(page('Setup', '<div class="card rv"><h2>⚠️ Add DISCORD_CLIENT_SECRET variable</h2></div>'));
  const u = new URL('https://discord.com/oauth2/authorize');
  u.searchParams.set('client_id', CLIENT_ID);
  u.searchParams.set('response_type', 'code');
  u.searchParams.set('redirect_uri', redirectUri(req));
  u.searchParams.set('scope', 'identify guilds');
  res.redirect(u.toString());
});
app.get('/auth/callback', async (req, res) => {
  try {
    const body = new URLSearchParams({ client_id: CLIENT_ID, client_secret: SECRET, grant_type: 'authorization_code', code: req.query.code, redirect_uri: redirectUri(req) });
    const tok = await (await fetch('https://discord.com/api/oauth2/token', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body })).json();
    if (!tok.access_token) throw new Error('token exchange failed');
    const me = await (await fetch('https://discord.com/api/users/@me', { headers: { Authorization: `Bearer ${tok.access_token}` } })).json();
    const gs = await (await fetch('https://discord.com/api/users/@me/guilds', { headers: { Authorization: `Bearer ${tok.access_token}` } })).json();
    if (!gs.some((g) => g.id === GUILD_ID)) return res.status(403).send(page('Denied', '<div class="card rv"><h2>🚫 RizokMC server ke member nahi ho</h2></div>'));
    if (!isOwner(me.id)) return res.status(403).send(page('Access Denied', '<div class="card rv"><h2>🔒 Owners Only</h2><p style="color:var(--dim);margin-top:10px">Ye dashboard sirf <b style="color:var(--gold)">SpacyGaming</b> aur <b style="color:var(--gold)">VexaroYT</b> ke liye hai — dusri Discord IDs access nahi kar sakti.</p></div>'));
    makeSession(res, me.id);
    res.redirect('/dashboard');
  } catch (e) { res.status(500).send(page('Error', `<div class="card rv"><h2>❌ ${e.message}</h2></div>`)); }
});
app.get('/logout', (req, res) => { res.setHeader('Set-Cookie', 'rmc=; Path=/; Max-Age=0'); res.redirect('/'); });

// ---------- API ----------
app.get('/api/state', async (req, res) => {
  const uid = getSession(req); if (!uid || !isOwner(uid)) return res.status(401).json({ error: 'unauthorized' });
  const g = await guild(); const cfg = getGuildConfig(GUILD_ID); const s = musicSession(GUILD_ID);
  res.json({
    name: g.name, members: g.memberCount, online: g.members.cache.filter((m) => m.presence?.status !== 'offline').size,
    roles: g.roles.cache.size, channels: g.channels.cache.size,
    automod: { antilink: cfg.antilink, antiinvite: cfg.antiinvite, antibadwords: cfg.antibadwords, anticaps: cfg.anticaps, antispam: cfg.antispam, antinuke: cfg.antinuke },
    welcome: { message: cfg.welcomeMessage, channel: cfg.welcomeChannel },
    music: s?.current ? { title: s.current.title, url: s.current.url } : null,
    staff: isStaffMember(await memberOf(uid)),
  });
});
app.post('/api/announce', async (req, res) => {
  const uid = getSession(req); const m = (uid && isOwner(uid)) ? await memberOf(uid) : null;
  if (!m) return res.status(401).json({ error: 'unauthorized' });
  if (!isStaffMember(m)) return res.status(403).json({ error: 'staff only' });
  const { channelId, content } = req.body;
  if (!content?.trim()) return res.status(400).json({ error: 'empty message' });
  const g = await guild(); const ch = g.channels.cache.get(channelId);
  if (!ch?.isTextBased()) return res.status(400).json({ error: 'bad channel' });
  const msg = await ch.send({ content: content.slice(0, 1900) });
  res.json({ ok: true, id: msg.id });
});
app.post('/api/automod', async (req, res) => {
  const uid = getSession(req); const m = (uid && isOwner(uid)) ? await memberOf(uid) : null;
  if (!m) return res.status(401).json({ error: 'unauthorized' });
  if (!isStaffMember(m)) return res.status(403).json({ error: 'staff only' });
  const patch = {};
  for (const k of ['antilink', 'antiinvite', 'antibadwords', 'anticaps', 'antispam', 'antinuke']) if (k in req.body) patch[k] = !!req.body[k];
  setGuildConfig(GUILD_ID, patch); res.json({ ok: true });
});
app.post('/api/welcome', async (req, res) => {
  const uid = getSession(req); const m = (uid && isOwner(uid)) ? await memberOf(uid) : null;
  if (!m) return res.status(401).json({ error: 'unauthorized' });
  if (!isStaffMember(m)) return res.status(403).json({ error: 'staff only' });
  const patch = {};
  if (typeof req.body.message === 'string') patch.welcomeMessage = req.body.message.slice(0, 500);
  if (req.body.channel) patch.welcomeChannel = req.body.channel;
  setGuildConfig(GUILD_ID, patch); res.json({ ok: true });
});
app.post('/api/welcome-test', async (req, res) => {
  const uid = getSession(req); const m = (uid && isOwner(uid)) ? await memberOf(uid) : null;
  if (!m) return res.status(401).json({ error: 'unauthorized' });
  if (!isStaffMember(m)) return res.status(403).json({ error: 'staff only' });
  const g = await guild(); const cfg = getGuildConfig(GUILD_ID);
  const ch = g.channels.cache.get(cfg.welcomeChannel);
  if (!ch) return res.status(400).json({ error: 'no welcome channel' });
  const text = (cfg.welcomeMessage || 'Welcome {user}!')
    .replace('{user}', `<@${m.id}>`).replace('{server}', g.name).replace('{count}', String(g.memberCount))
    .replace('{inviterline}', '*(preview)*');
  const eb = new EmbedBuilder().setColor(Colors.Blurple)
    .setAuthor({ name: 'W E L C O M E  T O  R I Z O K M C' })
    .setDescription(text)
    .addFields({ name: `${E.ppick ?? '⛏️'} Server IP`, value: '**play.rizokmc.fun**' }, { name: `${E.pgem ?? '💎'} Bedrock Port`, value: '**25609**' })
    .setFooter({ text: 'Dashboard preview' }).setTimestamp();
  if (E.banner_welcome) eb.setImage(E.banner_welcome);
  await ch.send({ embeds: [eb] });
  res.json({ ok: true });
});
// ---------- store ranks ----------
const RANKS_FILE = path.join(__dirname, '..', 'data', 'ranks.json');
app.get('/api/ranks', async (req, res) => {
  const uid = getSession(req); if (!uid || !isOwner(uid)) return res.status(401).json({ error: 'unauthorized' });
  let cfg; try { cfg = JSON.parse(readFileSync(RANKS_FILE, 'utf8')); } catch { return res.json([]); }
  const g = await guild();
  res.json(cfg.ranks.map((r) => {
    const role = g.roles.cache.get(r.role);
    return { ...r, count: role ? role.members.size : 0 };
  }));
});
app.get('/api/members', async (req, res) => {
  const uid = getSession(req); if (!uid || !isOwner(uid)) return res.status(401).json({ error: 'unauthorized' });
  const q = (req.query.q || '').trim();
  if (q.length < 2) return res.json([]);
  const g = await guild();
  const m = await g.members.fetch({ query: q, limit: 8 }).catch(() => null);
  res.json(m ? [...m.values()].map((x) => ({ id: x.id, tag: x.user.username, nick: x.nickname || '' })) : []);
});
app.post('/api/ranks/assign', async (req, res) => {
  const uid = getSession(req); if (!uid || !isOwner(uid)) return res.status(401).json({ error: 'unauthorized' });
  const { uid: target, key, action } = req.body || {};
  let cfg; try { cfg = JSON.parse(readFileSync(RANKS_FILE, 'utf8')); } catch { return res.status(500).json({ error: 'no ranks config' }); }
  const rank = cfg.ranks.find((r) => r.key === key);
  if (!target || !rank) return res.status(400).json({ error: 'member + rank chahiye' });
  const g = await guild();
  const mem = await g.members.fetch(target).catch(() => null);
  if (!mem) return res.status(404).json({ error: 'member nahi mila' });
  try {
    if (action === 'remove') await mem.roles.remove(rank.role);
    else await mem.roles.add(rank.role);
    console.log(`[ranks] ${rank.name} ${action === 'remove' ? 'removed from' : 'assigned to'} ${mem.user.username} by owner`);
    res.json({ ok: true, tag: mem.user.username, rank: rank.name, action: action === 'remove' ? 'removed' : 'assigned' });
  } catch (e) { res.status(500).json({ error: String(e.message || e).slice(0, 140) }); }
});

app.get('/api/modlog', async (req, res) => {
  const uid = getSession(req); if (!uid || !isOwner(uid)) return res.status(401).json({ error: 'unauthorized' });
  const cfg = getGuildConfig(GUILD_ID); const g = await guild();
  const ch = g.channels.cache.get(cfg.modlog); if (!ch) return res.json([]);
  const msgs = await ch.messages.fetch({ limit: 15 });
  res.json([...msgs.values()].reverse().map((m) => ({ title: m.embeds[0]?.title ?? '', desc: (m.embeds[0]?.description ?? '').slice(0, 400), time: m.createdTimestamp })));
});
app.get('/api/channels', async (req, res) => {
  const uid = getSession(req); if (!uid || !isOwner(uid)) return res.status(401).json({ error: 'unauthorized' });
  const g = await guild();
  res.json([...g.channels.cache.values()].filter((c) => c.isTextBased() && c.type === 0).map((c) => ({ id: c.id, name: c.name })));
});
app.post('/api/music', async (req, res) => {
  const uid = getSession(req); const m = (uid && isOwner(uid)) ? await memberOf(uid) : null;
  if (!m) return res.status(401).json({ error: 'unauthorized' });
  if (!isStaffMember(m)) return res.status(403).json({ error: 'staff only' });
  const a = req.body.action;
  if (a === 'skip') skip(GUILD_ID); if (a === 'pause') pause(GUILD_ID);
  if (a === 'resume') resume(GUILD_ID); if (a === 'stop') stopAll(GUILD_ID);
  res.json({ ok: true });
});
app.get('/api/voicechannels', async (req, res) => {
  const uid = getSession(req); if (!uid || !isOwner(uid)) return res.status(401).json({ error: 'unauthorized' });
  const g = await guild();
  res.json([...g.channels.cache.values()].filter((c) => c.isVoiceBased()).map((c) => ({ id: c.id, name: c.name })));
});
app.get('/api/music-search', async (req, res) => {
  const uid = getSession(req); const m = (uid && isOwner(uid)) ? await memberOf(uid) : null;
  if (!m) return res.status(401).json({ error: 'unauthorized' });
  const q = String(req.query.q ?? '').trim().slice(0, 120);
  if (!q) return res.json([]);
  res.json(await searchTracks(q, 5));
});
app.post('/api/music-play', async (req, res) => {
  const uid = getSession(req); const m = (uid && isOwner(uid)) ? await memberOf(uid) : null;
  if (!m) return res.status(401).json({ error: 'unauthorized' });
  if (!isStaffMember(m)) return res.status(403).json({ error: 'staff only' });
  const { channelId, query } = req.body;
  if (!channelId || !query) return res.status(400).json({ error: 'channelId + query required' });
  const g = await guild();
  const textCh = [...g.channels.cache.values()].find((c) => c.isTextBased() && c.type === 0);
  res.json(await playInChannel(g, String(channelId), String(query).slice(0, 200), textCh));
});
app.get('/api/botprofile', (req, res) => {
  const uid = getSession(req); if (!uid || !isOwner(uid)) return res.status(401).json({ error: 'unauthorized' });
  const p = readProfile();
  res.json({
    username: client?.user?.username ?? 'RizokMC',
    avatar: client?.user?.displayAvatarURL?.({ size: 128 }) ?? '',
    bio: p.bio ?? '', statusText: p.statusText ?? '', statusType: p.statusType ?? 'playing', presence: p.presence ?? 'online',
  });
});
app.post('/api/botprofile', async (req, res) => {
  const uid = getSession(req); const m = (uid && isOwner(uid)) ? await memberOf(uid) : null;
  if (!m) return res.status(401).json({ error: 'unauthorized' });
  if (!isStaffMember(m)) return res.status(403).json({ error: 'staff only' });
  const p = readProfile(); const errs = [];
  const patchUser = async (body) => {
    const r = await fetch('https://discord.com/api/v10/users/@me', {
      method: 'PATCH',
      headers: { Authorization: `Bot ${process.env.DISCORD_TOKEN}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!r.ok) {
      const j = await r.json().catch(() => ({}));
      let why = `HTTP ${r.status}`;
      if (r.status === 429) why = 'Discord allows only 2 renames per hour — try later';
      else if (j.username?.[0]) why = j.username[0];
      else if (j.bio?.[0]) why = j.bio[0];
      return why;
    }
    return null;
  };
  const newName = typeof req.body.username === 'string' ? req.body.username.trim().slice(0, 32) : '';
  if (newName && newName !== client?.user?.username) {
    const why = await patchUser({ username: newName }).catch((e) => e.message);
    if (why) errs.push(`username: ${why}`);
  }
  if (typeof req.body.bio === 'string') {
    p.bio = req.body.bio.slice(0, 190);
    const rb = await fetch('https://discord.com/api/v10/applications/@me', {
      method: 'PATCH',
      headers: { Authorization: `Bot ${process.env.DISCORD_TOKEN}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ description: p.bio }),
    }).catch(() => null);
    if (!rb || !rb.ok) errs.push(`bio: HTTP ${rb ? rb.status : 'network'}`);
  }
  if (typeof req.body.statusText === 'string') p.statusText = req.body.statusText.slice(0, 128);
  if (ACT_TYPES[req.body.statusType]) p.statusType = req.body.statusType;
  if (['online', 'idle', 'dnd', 'invisible'].includes(req.body.presence)) p.presence = req.body.presence;
  writeProfile(p); applyPresence(p);
  res.json({ ok: errs.length === 0, errors: errs });
});
app.post('/api/voice-test', async (req, res) => {
  const uid = getSession(req); const m = (uid && isOwner(uid)) ? await memberOf(uid) : null;
  if (!m) return res.status(401).json({ error: 'unauthorized' });
  const g = await guild();
  const vc = [...g.channels.cache.values()].find((c) => c.isVoiceBased());
  if (!vc) return res.json({ ok: false, error: 'No voice channel found' });
  // raw UDP egress probe (DNS query to 8.8.8.8:53)
  const udpProbe = await new Promise((resolve) => { (async () => {
    try {
      const dgram = (await import('node:dgram')).default;
      const s = dgram.createSocket('udp4');
      const t = setTimeout(() => { s.close(); resolve(false); }, 5000);
      s.on('message', () => { clearTimeout(t); s.close(); resolve(true); });
      s.on('error', () => { clearTimeout(t); s.close(); resolve(false); });
      // DNS query for example.com (A)
      const q = Buffer.from([0x12, 0x34, 0x01, 0x00, 0x00, 0x01, 0, 0, 0, 0, 0, 0, 7, 101, 120, 97, 109, 112, 108, 101, 3, 99, 111, 109, 0, 0, 1, 0, 1]);
      s.send(q, 53, '8.8.8.8', () => {});
    } catch { resolve(false); }
  })(); });
  try {
    const { joinVoiceChannel, entersState, VoiceConnectionStatus } = await import('@discordjs/voice');
    const conn = joinVoiceChannel({ channelId: vc.id, guildId: g.id, adapterCreator: g.voiceAdapterCreator, selfDeaf: true });
    const states = []; const dbg = [];
    const errs = [];
    conn.on('stateChange', (o, n) => states.push(n));
    conn.on('debug', (m) => { if (dbg.length < 12) dbg.push(String(m).slice(0, 90)); });
    conn.on('error', (e) => errs.push(String(e.message).slice(0, 90)));
    try {
      await entersState(conn, VoiceConnectionStatus.Ready, 20_000);
      try { conn.destroy(); } catch {}
      res.json({ ok: true, channel: vc.name, states, udpProbe });
    } catch (e) {
      let st = 'unknown'; try { st = conn.state.status; try { conn.destroy(); } catch {} } catch {}
      res.json({ ok: false, error: 'end state: ' + st, states, dbg, errs, udpProbe });
    }
  } catch (e) {
    res.json({ ok: false, error: String(e.message).slice(0, 140) });
  }
});
app.get('/api/sounds', (req, res) => {
  const uid = getSession(req); if (!uid || !isOwner(uid)) return res.status(401).json({ error: 'unauthorized' });
  res.json(SOUNDS);
});
app.post('/api/sound-play', async (req, res) => {
  const uid = getSession(req); const m = (uid && isOwner(uid)) ? await memberOf(uid) : null;
  if (!m) return res.status(401).json({ error: 'unauthorized' });
  if (!isStaffMember(m)) return res.status(403).json({ error: 'staff only' });
  const { channelId, sound } = req.body;
  if (!channelId || !sound) return res.status(400).json({ error: 'channelId + sound required' });
  const g = await guild();
  res.json(await playSound(g, String(channelId), String(sound)));
});

// ---------- pages ----------
app.get('/', (req, res) => {
  const uid = getSession(req);
  res.send(page('RizokMC — Premium Dashboard', `
  <canvas id="stars"></canvas><div class="orb o1"></div><div class="orb o2"></div><div class="orb o3"></div><div id="glow"></div>
  <div class="hero">
    <span class="logoWrap"><img class="emblem" src="/assets/rmc-logo.png" alt="RizokMC"></span>
    <h1 class="grad type" id="heroT">RIZOKMC DASHBOARD</h1>
    <p class="sub">Premium control center — <b>play.rizokmc.fun</b></p>
    <a class="btn big" href="${uid ? '/dashboard' : '/auth'}"><img src="${em('bolt')}">${uid ? 'Open Dashboard' : 'Login with Discord'}</a>
    <div class="feat">
      <div class="fcard rv"><img src="${em('sword')}"><h3>AutoMod</h3><p>Gali, IP, links — full protection</p></div>
      <div class="fcard rv"><img src="${em('creeper')}"><h3>Security</h3><p>Anti-nuke + mod logs</p></div>
      <div class="fcard rv"><img src="${em('music')}"><h3>Music</h3><p>YouTube in voice chat</p></div>
      <div class="fcard rv"><img src="${em('gift') || em('coin')}"><h3>Events</h3><p>Giveaways & rewards</p></div>
      <div class="fcard rv"><img src="${em('heart')}"><h3>Welcome</h3><p>Animated premium welcomes</p></div>
      <div class="fcard rv"><img src="${em('ticket')}"><h3>Tickets</h3><p>RizokMC Support</p></div>
    </div>
  </div>`));
});

app.get('/dashboard', async (req, res) => {
  const uid = getSession(req); if (!uid) return res.redirect('/');
  if (!isOwner(uid)) return res.status(403).send(page('Access Denied', '<div class="card rv"><h2>🔒 Owners Only</h2><p style="color:var(--dim);margin-top:10px">Sirf SpacyGaming / VexaroYT ki Discord ID access kar sakti hai.</p></div>'));
  const member = await memberOf(uid);
  if (!member) return res.status(403).send(page('Denied', '<div class="card rv"><h2>🚫 Not a member</h2></div>'));
  const staff = isStaffMember(member);
  const chips = ['all', '💬 in-msg', 'core', 'arrows', 'blocks', 'mc', 'maint', 'faces', 'banners', 'misc']
    .map((c) => `<button class="chip${c === 'all' ? ' on' : ''}" data-c="${c === '💬 in-msg' ? 'usable' : c}">${c}</button>`).join('');
  const emoMapScript = '<script>window.EMO_MAP=' + JSON.stringify(Object.fromEntries(ANIM_EMOJIS.filter((e) => e.id).map((e) => [e.name, e.url]))) + ';</script>';
  const EMO_DATA = JSON.stringify(ANIM_EMOJIS.map((e) => [e.key, catOf(e.key), e.id ? `<a:${e.name}:${e.id}>` : '', e.url]));
  const emoAllScript = '<script>window.EMO_ALL=' + EMO_DATA + ';</script>';
  const emojiPicker = (big) => `<div class="egroup"><div class="drwbar"><input class="in esrch" placeholder="Search ${ANIM_EMOJIS.length} premium emojis...">${chips}<span class="ecount"></span></div><div class="drawer${big ? ' big' : ''}"></div></div>`;
  const lock = '<div class="card rv">🔒 Staff only</div>';
  const announceHTML = staff ? `
        <label>Channel</label><select id="achan" class="in"></select>
        <label>Message — emoji tap karo, message ke ANDAR live dikhega (koi code nahi)</label>
        ${emojiPicker(true)}
        <div id="atext" class="composer" contenteditable="true" data-ph="📢 Apna announcement yahan likho — emojis tap karke message me daalo..."></div>
        <button class="btn" id="asend"><img src="${em('bolt')}"> Send Announcement</button><div id="aout"></div>` : lock;
  const automodHTML = staff ? `<div id="toggles"></div><button class="btn" id="msave"><img src="${em('star')}"> Save Settings</button><div id="mout"></div>` : lock;
  const welcomeEditHTML = staff ? `
        <label>Message template — {user} {server} {count} {inviterline}</label>
        <textarea id="wmsg" rows="3" class="in"></textarea>
        <label>Channel</label><select id="wchan" class="in"></select>
        <button class="btn" id="wsave"><img src="${em('star')}"> Save</button>
        <button class="btn alt" id="wtest"><img src="${em('heart')}"> Send Test Welcome</button><div id="wout"></div>` : '';
  const musicCtrlHTML = staff ? `
        <div class="card rv">
          <label><img class="ico" src="${em('music')}"> Voice Channel — bot yahan join karega</label>
          <select id="vchan" class="in"></select>
          <label>YouTube song search karo</label>
          <div class="sbar"><input id="msrch" class="in" placeholder="e.g. lofi hip hop, Minecraft soundtrack, Alan Walker..."><button class="btn" id="mgo">🔍 Search</button></div>
          <div id="mres"></div>
          <div class="mbtns"><button class="btn" data-m="skip">⏭ Skip</button><button class="btn" data-m="pause">⏸ Pause</button><button class="btn" data-m="resume">▶ Resume</button><button class="btn red" data-m="stop">🛑 Stop</button><button class="btn alt" id="vtest">🩺 Voice Test</button></div>
          <div id="mpout"></div>
        </div>` : lock;
  const botHTML = staff ? `
        <div class="card rv">
          <div class="bprof"><img id="bpav" src="" alt=""><div><b id="btag" class="grad">RizokMC</b><p id="bbioline"></p></div></div>
          <label>Bot Name (username)</label><input id="bname" class="in" maxlength="32" placeholder="RizokMC">
          <label>Status text — "Playing …"</label><input id="bstat" class="in" maxlength="128" placeholder="⛏️ play.rizokmc.fun">
          <label>Status type</label>
          <select id="btype" class="in"><option value="playing">Playing</option><option value="streaming">Streaming</option><option value="listening">Listening to</option><option value="watching">Watching</option><option value="competing">Competing in</option></select>
          <label>Presence</label>
          <select id="bpres" class="in"><option value="online">🟢 Online</option><option value="idle">🌙 Idle</option><option value="dnd">⛔ Do Not Disturb</option><option value="invisible">👻 Invisible</option></select>
          <label>Bio — About Me (max 190)</label><textarea id="bbio" rows="3" class="in" maxlength="190" placeholder="⛏️ Official security & music bot of RizokMC..."></textarea>
          <button class="btn" id="bsave"><img src="${em('star')}"> Save Bot Profile</button>
          <p style="color:var(--dim);font-size:11.5px;margin-top:8px">⚠️ Discord username change sirf 2 baar/hour allowed hai.</p>
          <div id="bout"></div>
        </div>` : lock;
  const soundHTML = staff ? `
        <div class="card rv">
          <label>🔊 Voice Channel — sound yahan bajega</label>
          <select id="svchan" class="in"></select>
          <p style="color:var(--dim);font-size:12.5px;margin:8px 0">Sound dabao — bot VC me join karke turant bajayega. (Awaz Railway host pe aati hai — sandbox voice block hai.)</p>
          <div class="sgrid">${SOUNDS.map((s) => `<button class="sbtn rv" data-s="${s.key}"><img src="${em(s.icon)}"><span>${s.name}</span></button>`).join('')}</div>
          <div id="sout"></div>
        </div>` : lock;
  res.send(page('RizokMC Dashboard', `${emoMapScript}${emoAllScript}
  <canvas id="stars"></canvas><div class="orb o1"></div><div class="orb o2"></div><div id="glow"></div>
  <div class="wrap">
    <aside class="side">
      <div class="slogo"><img src="/assets/rmc-logo.png" alt=""> RIZOKMC</div>
      <a class="nav on" data-p="overview"><img src="${em('coin')}"><span>Overview</span></a>
      <a class="nav" data-p="announce"><img src="${em('bolt')}"><span>Announce</span></a>
      <a class="nav" data-p="automod"><img src="${em('sword')}"><span>AutoMod</span></a>
      <a class="nav" data-p="welcome"><img src="${em('heart')}"><span>Welcome</span></a>
      <a class="nav" data-p="ranks"><img src="${em('trophy')}"><span>Ranks</span></a>
      <a class="nav" data-p="modlog"><img src="${em('lock')}"><span>Mod Logs</span></a>
      <a class="nav" data-p="music"><img src="${em('music')}"><span>Music</span></a>
      <a class="nav" data-p="bot"><img src="${em('crown')}"><span>Bot Profile</span></a>
      <a class="nav" data-p="sounds"><img src="${em('fire')}"><span>Sounds</span></a>
      <a class="nav" data-p="emojis"><img src="${em('gem')}"><span>Emojis</span></a>
      <a class="nav" href="/logout"><img src="${em('tnt')}"><span>Logout</span></a>
    </aside>
    <main>
      <section id="overview" class="panel on">
        <h2 class="grad"><img src="${em('star')}"> Server Overview</h2>
        <div class="stats" id="stats"></div>
        <div class="card rv" id="musiccard"></div>
      </section>
      <section id="announce" class="panel">
        <h2 class="grad"><img src="${em('bolt')}"> Announcement Composer</h2>
        ${announceHTML}
      </section>
      <section id="automod" class="panel">
        <h2 class="grad"><img src="${em('sword')}"> AutoMod Controls</h2>
        ${automodHTML}
      </section>
      <section id="welcome" class="panel">
        <h2 class="grad"><img src="${em('heart')}"> Welcome System</h2>
        <div class="preview rv" id="wprev"></div>
        ${welcomeEditHTML}
      </section>
      <section id="ranks" class="panel">
        <h2 class="grad"><img src="${em('trophy')}"> Store Ranks</h2>
        <div class="card rv">
          <label>Member dhundo — username type karo, result pe click karke select karo</label>
          <input id="rksearch" class="in" placeholder="e.g. spacygaming...">
          <div id="rkresults"></div>
          <label>Rank select karo</label>
          <select id="rkrank" class="in"></select>
          <div class="mbtns"><button class="btn" id="rkadd">✅ Assign Rank</button><button class="btn red" id="rkremove">❌ Remove Rank</button></div>
          <div id="rkout"></div>
        </div>
        <div id="rkcards" class="feat"></div>
      </section>
      <section id="modlog" class="panel">
        <h2 class="grad"><img src="${em('lock')}"> Mod Logs</h2>
        <div id="mlog"></div>
      </section>
      <section id="music" class="panel">
        <h2 class="grad"><img src="${em('music')}"> Music Studio</h2>
        <div class="card rv" id="mstat">Loading...</div>
        ${musicCtrlHTML}
      </section>
      <section id="bot" class="panel">
        <h2 class="grad"><img src="${em('crown')}"> Bot Profile</h2>
        ${botHTML}
      </section>
      <section id="sounds" class="panel">
        <h2 class="grad"><img src="${em('fire')}"> Soundboard</h2>
        ${soundHTML}
      </section>
      <section id="emojis" class="panel">
        <h2 class="grad"><img src="${em('gem')}"> Emoji Vault — ${ANIM_EMOJIS.length} Premium</h2>
        <div class="card rv">
          <p style="color:var(--dim);font-size:13px;margin-bottom:6px">Sab custom animated premium emojis — search + category filter. Discord wale emojis click karke announcement me insert hote hain.</p>
          ${emojiPicker(true)}
        </div>
      </section>
    </main>
  </div>`));
});

// ---------- premium UI shell ----------
function page(title, body) {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>${title}</title><style>
:root{--bg:#08050f;--card:rgba(26,16,46,.62);--line:rgba(168,85,247,.28);--gold:#ffd700;--cyan:#00d4ff;--purp:#a855f7;--txt:#efeaff;--dim:#9d92c2;--btna:#7c3aed;--btnb:#00b7d4}
*{margin:0;padding:0;box-sizing:border-box;-webkit-tap-highlight-color:transparent}
html{scroll-behavior:smooth}
body{background:var(--bg) url('/assets/dashboard-bg.jpg') center/cover fixed;color:var(--txt);font-family:'Segoe UI',system-ui,sans-serif;min-height:100vh;overflow-x:hidden}
body::before{content:'';position:fixed;inset:0;background:radial-gradient(1200px 600px at 80% -10%,rgba(124,58,237,.25),transparent),radial-gradient(900px 500px at 10% 110%,rgba(0,180,216,.18),transparent),rgba(8,5,15,.78);z-index:-1}
#stars{position:fixed;inset:0;z-index:-1;pointer-events:none}
#glow{position:fixed;width:340px;height:340px;border-radius:50%;pointer-events:none;z-index:0;background:radial-gradient(circle,rgba(168,85,247,.22),transparent 70%);transform:translate(-50%,-50%);left:-999px;top:-999px}
.orb{position:fixed;border-radius:50%;filter:blur(90px);opacity:.5;z-index:-1;animation:drift 16s ease-in-out infinite alternate}
.o1{width:420px;height:420px;background:var(--btna);top:-120px;right:-120px}
.o2{width:360px;height:360px;background:var(--btnb);bottom:-140px;left:-100px;animation-delay:-8s}
.o3{width:300px;height:300px;background:#be185d;top:40%;left:-160px;animation-delay:-4s}
@keyframes drift{from{transform:translate(0,0) scale(1)}to{transform:translate(60px,40px) scale(1.15)}}
@keyframes float{0%,100%{transform:translateY(0) rotate(-2deg)}50%{transform:translateY(-14px) rotate(2deg)}}
@keyframes fadeup{from{opacity:0;transform:translateY(26px) scale(.97)}to{opacity:1;transform:none}}
@keyframes shine{to{background-position:200% center}}
@keyframes pop{0%{transform:scale(.6)}70%{transform:scale(1.12)}100%{transform:scale(1)}}
@keyframes ripple{to{transform:scale(3.2);opacity:0}}
.grad{background:linear-gradient(90deg,var(--gold),var(--cyan),var(--purp),var(--gold));background-size:200%;-webkit-background-clip:text;background-clip:text;color:transparent;animation:shine 5s linear infinite}
.grad img{-webkit-text-fill:initial;color:initial}
h2.grad{display:flex;align-items:center;gap:10px;font-size:clamp(22px,4vw,30px);margin-bottom:18px}
h2 img{width:34px}
.rv{animation:fadeup .7s cubic-bezier(.2,.7,.3,1) both}
.hero{max-width:1000px;margin:0 auto;padding:clamp(40px,8vh,90px) 20px 60px;text-align:center;position:relative;z-index:1}
.emblem{width:clamp(80px,16vw,120px);animation:float 3.5s ease-in-out infinite;filter:drop-shadow(0 0 26px rgba(168,85,247,.8))}
.hero h1{font-size:clamp(38px,8vw,72px);letter-spacing:3px;margin:18px 0 6px;font-weight:900}
.sub{color:var(--dim);font-size:clamp(14px,2.6vw,18px);margin-bottom:30px}
.sub b{color:var(--cyan)}
.btn{position:relative;overflow:hidden;display:inline-flex;align-items:center;gap:9px;background:linear-gradient(135deg,var(--btna),var(--btnb));color:#fff;padding:13px 26px;border-radius:14px;border:none;cursor:pointer;font-weight:800;font-size:15px;text-decoration:none;box-shadow:0 8px 28px rgba(124,58,237,.4);transition:transform .2s,box-shadow .2s}
.btn img{width:22px}
.btn:hover{transform:translateY(-3px) scale(1.02);box-shadow:0 12px 34px rgba(0,212,255,.45)}
.btn:active{transform:scale(.97)}
.btn.alt{background:linear-gradient(135deg,#be185d,#7c3aed)}
.btn.red{background:linear-gradient(135deg,#e11d48,#7f1d1d)}
.btn.big{font-size:17px;padding:16px 34px}
.rip{position:absolute;width:60px;height:60px;border-radius:50%;background:rgba(255,255,255,.5);transform:scale(0);animation:ripple .6s ease-out forwards;pointer-events:none}
.feat{display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:14px;margin-top:54px}
.fcard{background:var(--card);backdrop-filter:blur(14px);border:1px solid var(--line);border-radius:18px;padding:22px 14px;transition:transform .25s,border-color .25s,box-shadow .25s}
.fcard:hover{transform:translateY(-8px) rotate(-.5deg);border-color:var(--cyan);box-shadow:0 16px 40px rgba(0,212,255,.18)}
.fcard img{width:46px;margin-bottom:10px;animation:pop .6s both}
.fcard h3{color:var(--gold);margin-bottom:5px;font-size:16px}
.fcard p{color:var(--dim);font-size:12.5px}
.wrap{display:flex;min-height:100vh;position:relative;z-index:1}
.side{width:225px;background:rgba(12,7,24,.88);backdrop-filter:blur(16px);padding:20px 12px;border-right:1px solid var(--line);position:sticky;top:0;height:100vh;display:flex;flex-direction:column;gap:4px}
.slogo{font-weight:900;font-size:20px;color:var(--gold);display:flex;gap:10px;align-items:center;margin:4px 8px 22px;letter-spacing:2px}
.slogo img{width:36px;animation:float 3s infinite}
.nav{display:flex;align-items:center;gap:12px;color:var(--dim);text-decoration:none;padding:11px 14px;border-radius:12px;font-weight:700;transition:.2s;cursor:pointer}
.nav img{width:26px}
.nav:hover{background:rgba(124,58,237,.18);color:#fff;transform:translateX(4px)}
.nav.on{background:linear-gradient(90deg,rgba(124,58,237,.5),rgba(0,183,212,.22));color:#fff;box-shadow:inset 0 0 0 1px rgba(0,212,255,.35)}
main{flex:1;padding:clamp(18px,3.5vw,40px);max-width:1050px}
.panel{display:none}
.card{background:var(--card);backdrop-filter:blur(12px);border:1px solid var(--line);border-radius:16px;padding:18px;margin:14px 0}
.stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:14px}
.stat{background:linear-gradient(150deg,rgba(124,58,237,.32),rgba(15,9,30,.85));border:1px solid rgba(0,212,255,.22);border-radius:18px;padding:22px 12px;text-align:center;transition:.25s}
.stat:hover{transform:translateY(-5px);border-color:var(--gold)}
.stat span{font-size:clamp(26px,4vw,38px);font-weight:900;color:var(--cyan);display:block;text-shadow:0 0 18px rgba(0,212,255,.5)}
.stat small{color:var(--dim);font-weight:700;letter-spacing:1px}
label{display:block;margin:14px 0 6px;color:var(--dim);font-weight:700;font-size:13px;letter-spacing:.5px}
.in,select.in,textarea.in{width:100%;background:#140c26;color:var(--txt);border:1px solid var(--line);border-radius:12px;padding:12px;font-size:14px;transition:border .2s}
.in:focus{outline:none;border-color:var(--cyan);box-shadow:0 0 0 3px rgba(0,212,255,.15)}
.drawer{display:flex;gap:8px;flex-wrap:wrap;margin:10px 0;padding:12px;background:rgba(15,9,30,.6);border:1px solid var(--line);border-radius:14px;max-height:150px;overflow-y:auto}
.emo{background:rgba(30,20,52,.85);border:1px solid var(--line);border-radius:12px;padding:6px;cursor:pointer;transition:transform .15s,border-color .15s}
.emo:hover{transform:scale(1.25) rotate(-4deg);border-color:var(--gold);z-index:2}
.emo img{width:34px;display:block}
.trow{display:flex;justify-content:space-between;align-items:center;background:var(--card);border:1px solid var(--line);padding:14px 18px;border-radius:14px;margin-bottom:10px;text-transform:capitalize;font-weight:700}
.sw{position:relative;width:54px;height:30px;display:inline-block}
.sw input{opacity:0;width:0;height:0}
.sw i{position:absolute;inset:0;background:#33245c;border-radius:20px;transition:.3s;cursor:pointer}
.sw i:before{content:'';position:absolute;width:24px;height:24px;left:3px;top:3px;background:#8f85b0;border-radius:50%;transition:.3s cubic-bezier(.3,1.6,.5,1)}
.sw input:checked+i{background:linear-gradient(90deg,var(--btna),var(--btnb));box-shadow:0 0 14px rgba(0,212,255,.4)}
.sw input:checked+i:before{transform:translateX(24px);background:#fff}
.preview{background:#313338;border-radius:12px;padding:16px;margin:14px 0;border:1px solid #1e1f22}
.preview .emb{border-left:4px solid #5865f2;background:#2b2d31;border-radius:4px;padding:12px 14px;max-width:560px}
.preview .auth{color:#fff;font-weight:700;font-size:13px;letter-spacing:2px;display:flex;align-items:center;gap:8px}
.preview .auth img{width:22px}
.preview .desc{color:#dbdee1;font-size:13.5px;margin:8px 0;white-space:pre-line}
.preview img.banner{width:100%;max-width:340px;border-radius:8px;margin-top:6px}
.preview .fld{display:inline-block;margin:6px 14px 0 0}
.preview .fld b{color:#fff;font-size:12px;display:block}
.preview .fld span{color:#dbdee1;font-size:13px}
.logcard{background:var(--card);border-left:4px solid var(--purp);border-radius:12px;padding:14px 18px;margin-bottom:12px;transition:.2s}
.logcard:hover{transform:translateX(6px);border-left-color:var(--cyan)}
.logcard b{color:var(--cyan)}
.logcard pre{white-space:pre-wrap;color:#c9c0e4;font-size:12.5px;margin:6px 0;font-family:inherit}
.logcard time{color:#7d739c;font-size:11px}
.ok{color:#43b581;margin-top:10px;font-weight:700}.err{color:#f04747;margin-top:10px;font-weight:700}
.mbtns{display:flex;gap:10px;flex-wrap:wrap;margin-top:12px}
#themeBtn{position:fixed;top:14px;right:14px;z-index:60;width:46px;height:46px;border-radius:50%;border:1px solid var(--line);background:rgba(20,12,38,.9);backdrop-filter:blur(8px);font-size:21px;cursor:pointer;transition:transform .35s,border-color .3s;box-shadow:0 6px 20px rgba(0,0,0,.4)}
#themeBtn:hover{transform:rotate(180deg) scale(1.12);border-color:var(--gold)}
.chip{background:#241640;border:1px solid var(--line);color:var(--dim);border-radius:20px;padding:6px 13px;font-size:11.5px;font-weight:800;cursor:pointer;text-transform:uppercase;letter-spacing:.5px;transition:.2s;white-space:nowrap}
.chip:hover{border-color:var(--cyan);color:#fff}
.chip.on{background:linear-gradient(90deg,var(--btna),var(--btnb));color:#fff;border-color:transparent}
.drwbar{display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin:10px 0}
.drwbar .esrch{flex:1;min-width:170px}
.ecount{color:var(--gold);font-size:12px;font-weight:800;white-space:nowrap}
.drawer.big{max-height:480px}
.sbar{display:flex;gap:8px}.sbar .in{flex:1}
.srow{display:flex;gap:10px;align-items:center;background:rgba(30,20,52,.7);border:1px solid var(--line);border-radius:12px;padding:8px 12px;margin:8px 0;transition:.2s}
.srow:hover{border-color:var(--cyan);transform:translateX(4px)}
.srow img{width:68px;border-radius:8px;flex-shrink:0}
.srow div{flex:1;min-width:0}
.srow b{display:block;font-size:13.5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.srow small{color:var(--dim)}
.bprof{display:flex;gap:14px;align-items:center;margin-bottom:6px}
.bprof img{width:66px;height:66px;border-radius:50%;border:2px solid var(--gold);box-shadow:0 0 18px rgba(255,215,0,.35)}
.bprof b{font-size:19px;font-weight:900}
.bprof p{color:var(--dim);font-size:13px;margin-top:3px}
label .ico{width:18px;vertical-align:-3px}
.sgrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(104px,1fr));gap:10px;margin-top:12px}
.sbtn{display:flex;flex-direction:column;align-items:center;gap:6px;background:linear-gradient(160deg,rgba(124,58,237,.28),rgba(15,9,30,.85));border:1px solid var(--line);border-radius:14px;padding:14px 8px;cursor:pointer;color:var(--txt);font-weight:800;font-size:12px;transition:.2s}
.sbtn img{width:38px;transition:.2s}
.sbtn:hover{transform:translateY(-4px) scale(1.04);border-color:var(--gold);box-shadow:0 10px 26px rgba(255,215,0,.15)}
.sbtn:hover img{transform:scale(1.2) rotate(-6deg)}
.sbtn:active{transform:scale(.94)}
.sbtn.playing{border-color:var(--cyan);box-shadow:0 0 0 2px var(--cyan),0 0 24px rgba(0,212,255,.5);animation:pop .3s}
.aprev{background:#313338;border:1px solid #1e1f22;border-radius:12px;padding:14px;min-height:64px;color:#dbdee1;font-size:14.5px;white-space:pre-wrap;word-break:break-word;line-height:1.7}
.aprev:empty:before{content:'✍️ Yahan apna message + animated emojis live dikhenge...';color:#7d8590;font-size:13px}
.iem{width:30px;height:30px;vertical-align:-8px;margin:0 1px;animation:pop .3s both}
.composer{background:#140c26;border:1px solid var(--line);border-radius:12px;padding:12px;min-height:120px;max-height:280px;overflow-y:auto;color:var(--txt);font-size:15px;line-height:1.8;white-space:pre-wrap;word-break:break-word;transition:border .2s}
.composer:focus{outline:none;border-color:var(--cyan);box-shadow:0 0 0 3px rgba(0,212,255,.15)}
.composer:empty:before{content:attr(data-ph);color:#7d739c}
.composer .iem{width:32px;height:32px}
.logoWrap{position:relative;display:inline-block}
.logoWrap:before{content:'';position:absolute;inset:-7px;border-radius:50%;background:conic-gradient(var(--gold),var(--cyan),var(--purp),var(--gold));animation:spin 4s linear infinite;z-index:-1;filter:blur(7px);opacity:.85}
@keyframes spin{to{transform:rotate(360deg)}}
.slogo img{width:40px;height:40px;border-radius:12px;box-shadow:0 0 16px rgba(0,212,255,.45)}
@keyframes slidein{from{opacity:0;transform:translateX(42px)}to{opacity:1;transform:none}}
.panel.on{display:block;animation:slidein .45s cubic-bezier(.2,.8,.3,1) both}
::-webkit-scrollbar{width:8px;height:8px}::-webkit-scrollbar-thumb{background:#7c3aed;border-radius:4px}::-webkit-scrollbar-track{background:transparent}
@media(max-width:860px){
 .wrap{flex-direction:column}
 .side{width:100%;height:auto;position:fixed;bottom:0;top:auto;flex-direction:row;overflow-x:auto;padding:8px 6px calc(8px + env(safe-area-inset-bottom));border-right:none;border-top:1px solid var(--line);z-index:50;gap:2px}
 .slogo,.nav span{display:none}
 .nav{flex:1;justify-content:center;padding:10px 8px}
 .nav img{width:26px}
 main{padding:16px 14px 96px}
 .feat{grid-template-columns:repeat(2,1fr)}
}
</style></head><body><button id="themeBtn" title="Change theme">🎨</button>${body}
<script>
// particle starfield
(function(){var c=document.getElementById('stars');if(!c)return;var x=c.getContext('2d');var S=[];function rs(){c.width=innerWidth;c.height=innerHeight}rs();addEventListener('resize',rs);
for(var i=0;i<70;i++)S.push({x:Math.random()*c.width,y:Math.random()*c.height,r:Math.random()*1.6+.3,v:Math.random()*.35+.08,h:Math.random()<.3});
(function tick(){x.clearRect(0,0,c.width,c.height);for(var i=0;i<S.length;i++){var s=S[i];s.y-=s.v;if(s.y<0)s.y=c.height;x.globalAlpha=.4+Math.sin(Date.now()/700+i)*.35;x.fillStyle=s.h?'#00d4ff':'#c4b5fd';x.beginPath();x.arc(s.x,s.y,s.r,0,7);x.fill()}x.globalAlpha=1;requestAnimationFrame(tick)})()})();
// cursor glow
addEventListener('pointermove',function(e){var g=document.getElementById('glow');if(g&&matchMedia('(pointer:fine)').matches){g.style.left=e.clientX+'px';g.style.top=e.clientY+'px'}});
// ripple buttons
document.addEventListener('click',function(e){var b=e.target.closest('.btn');if(!b)return;var r=document.createElement('span');r.className='rip';var q=b.getBoundingClientRect();r.style.left=(e.clientX-q.left-30)+'px';r.style.top=(e.clientY-q.top-30)+'px';b.appendChild(r);setTimeout(function(){r.remove()},650)});
// staggered reveals
var io=new IntersectionObserver(function(es){es.forEach(function(en){if(en.isIntersecting){en.target.style.animationDelay=(en.target.dataset.d||0)+'ms';en.target.classList.add('rv');io.unobserve(en.target)}})},{threshold:.1});
document.querySelectorAll('.fcard,.emo').forEach(function(el,i){el.dataset.d=(i%9)*60;io.observe(el)});
// typing hero
var T=['RIZOKMC DASHBOARD','PREMIUM CONTROL','YOUR SERVER • YOUR RULES'];var ti=0,ci=0,del=false;var ht=document.getElementById('heroT');
if(ht)(function typ(){var t=T[ti];ci+=del?-1:1;ht.textContent=t.slice(0,ci);var w=del?40:90;if(ci===t.length){del=true;w=1400}if(ci===0){del=false;ti=(ti+1)%T.length}setTimeout(typ,w)})();
// counter animation
function animNum(el,to){var st=null;function f(ts){if(!st)st=ts;var p=Math.min((ts-st)/900,1);el.textContent=Math.floor(to*(1-Math.pow(1-p,3)));if(p<1)requestAnimationFrame(f)}requestAnimationFrame(f)}
// nav
document.querySelectorAll('.nav[data-p]').forEach(function(a){a.onclick=function(e){e.preventDefault();document.querySelectorAll('.nav').forEach(function(n){n.classList.remove('on')});document.querySelectorAll('.panel').forEach(function(p){p.classList.remove('on')});a.classList.add('on');document.getElementById(a.dataset.p).classList.add('on')}});
// tilt cards (desktop)
if(matchMedia('(pointer:fine)').matches)document.addEventListener('mousemove',function(e){document.querySelectorAll('.fcard,.stat').forEach(function(c){var r=c.getBoundingClientRect();var dx=(e.clientX-r.left-r.width/2)/r.width,dy=(e.clientY-r.top-r.height/2)/r.height;if(Math.abs(dx)<1&&Math.abs(dy)<1)c.style.transform='perspective(700px) rotateY('+(dx*7)+'deg) rotateX('+(-dy*7)+'deg)'})});
// ---- app ----
var staff=false;
function api(u,o){return fetch(u,o).then(function(r){return r.json()})}
function esc(s){var d=document.createElement('div');d.textContent=s;return d.innerHTML}
function load(){
 api('/api/state').then(function(st){
  staff=st.staff;
  var el=document.getElementById('stats');
  if(el){el.innerHTML='';[['Members','members'],['Online','online'],['Roles','roles'],['Channels','channels']].forEach(function(p){var d=document.createElement('div');d.className='stat rv';var s=document.createElement('span');d.appendChild(s);var sm=document.createElement('small');sm.textContent=p[0];d.appendChild(sm);el.appendChild(d);animNum(s,st[p[1]])})}
  var mc=document.getElementById('musiccard');
  if(mc)mc.innerHTML=st.music?'<img style="width:34px;vertical-align:middle" src="${em('music')}"> Now playing: <b style="color:var(--cyan)">'+esc(st.music.title)+'</b>':'<img style="width:34px;vertical-align:middle" src="${em('music')}"> Music idle — use /play in voice';
  if(staff){
   api('/api/channels').then(function(ch){var o='';ch.forEach(function(c){o+='<option value="'+c.id+'">'+esc(c.name)+'</option>'});var a=document.getElementById('achan');if(a)a.innerHTML=o;var w=document.getElementById('wchan');if(w){w.innerHTML=o;w.value=st.welcome.channel||''}});
   var wm=document.getElementById('wmsg');if(wm)wm.value=st.welcome.message||'';
   var tg=document.getElementById('toggles');
   if(tg){tg.innerHTML='';Object.keys(st.automod).forEach(function(k){var r=document.createElement('div');r.className='trow rv';r.innerHTML='<span>'+k+'</span><label class="sw"><input type="checkbox" data-k="'+k+'" '+(st.automod[k]?'checked':'')+'><i></i></label>';tg.appendChild(r)})}
  }
  var wp=document.getElementById('wprev');
  if(wp)wp.innerHTML='<div class="emb"><div class="auth"><img src="${em('rmc')}">W E L C O M E&nbsp; T O&nbsp; R I Z O K M C</div><div class="desc">Welcome <b style="color:#00a8fc">@player</b> to <b>'+esc(st.name)+'</b>! 🎉\\nYou are member <b>#'+st.members+'</b>.</div><div><span class="fld"><b>⛏️ Server IP</b><span>play.rizokmc.fun</span></span><span class="fld"><b>💎 Bedrock</b><span>25609</span></span></div><img class="banner" src="${E.banner_welcome}"></div>';
  api('/api/modlog').then(function(logs){var m=document.getElementById('mlog');if(m){m.innerHTML='';logs.forEach(function(l){var d=document.createElement('div');d.className='logcard rv';d.innerHTML='<b>'+esc(l.title)+'</b><pre>'+esc(l.desc)+'</pre><time>'+new Date(l.time).toLocaleString()+'</time>';m.appendChild(d)});if(!logs.length)m.innerHTML='<div class="card">No logs yet.</div>'}});
  var ms=document.getElementById('mstat');
  if(ms)ms.innerHTML=st.music?'Now playing: <a style="color:var(--cyan)" href="'+st.music.url+'" target="_blank">'+esc(st.music.title)+'</a>':'Nothing playing right now.';
 });
}
// WYSIWYG composer — emojis as images inside the message box (no code visible)
function insertEmo(b){var ed=document.getElementById('atext');if(!ed||(!b.dataset.tag&&!b.dataset.url))return;
 var img=document.createElement('img');img.className='iem';img.src=b.querySelector('img').src;img.alt=b.dataset.key||'';
 if(b.dataset.tag)img.dataset.tag=b.dataset.tag;
 if(b.dataset.url)img.dataset.url=b.dataset.url;
 ed.focus();
 var sel=window.getSelection();
 if(sel&&sel.rangeCount&&ed.contains(sel.anchorNode)){var r=sel.getRangeAt(0);r.deleteContents();r.insertNode(img);r.setStartAfter(img);r.collapse(true);sel.removeAllRanges();sel.addRange(r)}
 else{ed.appendChild(img);var r2=document.createRange();r2.selectNodeContents(ed);r2.collapse(false);sel.removeAllRanges();sel.addRange(r2)}}
// emoji button clicks handled by picker delegation below
function composerText(){var ed=document.getElementById('atext');if(!ed)return '';var out='';
 ed.childNodes.forEach(function(n){
  if(n.nodeType===3)out+=n.textContent;
  else if(n.tagName==='IMG'&&n.dataset.tag)out+=n.dataset.tag;
  else if(n.tagName==='IMG'&&n.dataset.url)out+=(out&&out.slice(-1)!=='\\n'?'\\n':'')+location.origin+n.dataset.url+'\\n';
  else if(n.tagName==='BR')out+='\\n';
  else out+=(out&&out.slice(-1)!=='\\n'?'\\n':'')+n.textContent;
 });return out}
// emoji picker — client-side render + infinite scroll (8000+ emojis, phone-friendly)
document.querySelectorAll('.egroup').forEach(function(g){
 var dr=g.querySelector('.drawer');if(!dr)return;
 var s=g.querySelector('.esrch'),cnt=g.querySelector('.ecount');
 var EALL=window.EMO_ALL||[];
 var st={q:'',c:'all',n:240};
 function btn(a){return '<button class="emo rv" data-cat="'+a[1]+'" data-key="'+a[0]+'" '+(a[2]?'data-tag="'+a[2]+'"':'data-url="'+a[3]+'"')+' title="'+a[0]+'"><img src="'+a[3]+'" loading="lazy"></button>'}
 function render(){
  var f=EALL.filter(function(a){return (st.c==='all'||(st.c==='usable'?!!a[2]:a[1]===st.c))&&a[0].indexOf(st.q)>=0});
  dr.innerHTML=f.slice(0,st.n).map(btn).join('')+(f.length>st.n?'<button class="btn emore">Load more — '+(f.length-st.n)+' emojis left</button>':'');
  if(cnt)cnt.textContent=f.length+' emojis';
 }
 dr.addEventListener('click',function(e){var m=e.target.closest('.emore');if(m){st.n+=480;render();return}var b=e.target.closest('.emo');if(b)insertEmo(b)});
 if(s)s.oninput=function(){st.q=s.value.toLowerCase();st.n=240;render()};
 g.querySelectorAll('.chip').forEach(function(ch){ch.onclick=function(){g.querySelectorAll('.chip').forEach(function(x){x.classList.remove('on')});ch.classList.add('on');st.c=ch.dataset.c;st.n=240;render()}});
 render();
});
// premium theme switcher
var THEMES=[['#7c3aed','#00b7d4','rgba(168,85,247,.28)','#a855f7','#00d4ff'],['#b45309','#ffd700','rgba(255,215,0,.25)','#f59e0b','#ffe066'],['#7f1d1d','#ff4d6d','rgba(225,29,72,.25)','#e11d48','#ff8fab'],['#065f46','#22ff88','rgba(34,255,136,.2)','#10b981','#6ee7b7'],['#1e40af','#7dd3fc','rgba(59,130,246,.25)','#3b82f6','#93c5fd']];
function setTheme(i){var t=THEMES[i%THEMES.length];var r=document.documentElement.style;r.setProperty('--btna',t[0]);r.setProperty('--btnb',t[1]);r.setProperty('--line',t[2]);r.setProperty('--purp',t[3]);r.setProperty('--cyan',t[4]);try{localStorage.setItem('nexus-theme',i)}catch(e){}}
try{setTheme(parseInt(localStorage.getItem('nexus-theme')||'0',10))}catch(e){setTheme(0)}
var tb=document.getElementById('themeBtn');
if(tb)tb.onclick=function(){var cur=0;try{cur=parseInt(localStorage.getItem('nexus-theme')||'0',10)}catch(e){}setTheme(cur+1)};
// store ranks panel — cards + member search + assign/remove
(function(){
 if(!document.getElementById('rkcards'))return;
 var selUid=null;
 function loadRanks(){
  api('/api/ranks').then(function(ranks){
   var sel=document.getElementById('rkrank');
   if(sel&&sel.options.length===0){ranks.forEach(function(r){var o=document.createElement('option');o.value=r.key;o.textContent=r.emoji+' '+r.name+' — Rs.'+r.price;sel.appendChild(o)})}
   var c=document.getElementById('rkcards');if(!c)return;c.innerHTML='';
   ranks.forEach(function(r){
    var d=document.createElement('div');d.className='fcard rv';
    d.style.borderTop='4px solid #'+r.color.toString(16).padStart(6,'0');
    d.innerHTML='<h3>'+r.emoji+' '+r.name+'</h3><p style="font-size:22px;color:var(--cyan)"><b>₹'+r.price+'</b></p><p>🏠 '+r.perks.homes+' Homes<br>🛒 '+r.perks.auctions+' Auction slots<br>🗄️ '+r.perks.vaults+' Vaults<br>💺 /sit &nbsp;•&nbsp; ⚔️ Kits</p><p style="color:var(--dim)">'+r.count+' member'+(r.count===1?'':'s')+'</p>';
    c.appendChild(d);
   });
  });
 }
 loadRanks();
 var si=document.getElementById('rksearch'),res=document.getElementById('rkresults'),tm=null;
 if(si)si.oninput=function(){clearTimeout(tm);tm=setTimeout(function(){
  api('/api/members?q='+encodeURIComponent(si.value)).then(function(ms){
   res.innerHTML='';selUid=null;
   ms.forEach(function(m){var b=document.createElement('button');b.className='btn alt';b.style.margin='4px 4px 0 0';b.textContent=(m.nick?m.nick+' (@':'@')+m.tag+')';
    b.onclick=function(){selUid=m.id;res.querySelectorAll('button').forEach(function(x){x.classList.remove('alt');x.classList.add('red')});b.classList.remove('red');b.textContent='✔ '+m.tag;};
    res.appendChild(b)});
   if(!ms.length&&si.value.length>1)res.innerHTML='<p style="color:var(--dim)">Koi member nahi mila</p>';
  });
 },400)};
 function act(a){var out=document.getElementById('rkout');
  if(!selUid){out.textContent='⚠️ Pehle member select karo (search karke click karo)';return}
  var sel=document.getElementById('rkrank');
  api('/api/ranks/assign',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({uid:selUid,key:sel.value,action:a})}).then(function(r){
   out.textContent=r.ok?('✅ '+r.rank+' '+r.action+' → @'+r.tag):('❌ '+(r.error||'fail'));
   loadRanks();
  });
 }
 var ab=document.getElementById('rkadd'),rb=document.getElementById('rkremove');
 if(ab)ab.onclick=function(){act('add')};
 if(rb)rb.onclick=function(){act('remove')};
})();
// music studio: voice channels + search + play
if(document.getElementById('vchan'))api('/api/voicechannels').then(function(vcs){var o='';vcs.forEach(function(c){o+='<option value="'+c.id+'">🔊 '+esc(c.name)+'</option>'});var v=document.getElementById('vchan');if(v)v.innerHTML=o});
var mg=document.getElementById('mgo');
if(mg)mg.onclick=function(){
 var q=document.getElementById('msrch').value;if(!q)return;var rs=document.getElementById('mres');rs.innerHTML='<p style="color:var(--dim)">🔎 Searching YouTube...</p>';
 api('/api/music-search?q='+encodeURIComponent(q)).then(function(list){rs.innerHTML='';
  if(!list.length){rs.innerHTML='<p class="err">❌ No results — try another name</p>';return}
  list.forEach(function(t){var d=document.createElement('div');d.className='srow rv';
   var im=document.createElement('img');if(t.thumbnail)im.src=t.thumbnail;else im.style.display='none';
   var tx=document.createElement('div');tx.innerHTML='<b>'+esc(t.title)+'</b><small>⏱ '+esc(t.durationRaw||'')+'</small>';
   var b=document.createElement('button');b.className='btn';b.textContent='▶ Play';
   b.onclick=function(){var vc=document.getElementById('vchan').value;var o=document.getElementById('mpout');o.innerHTML='<p style="color:var(--dim)">🎵 Connecting...</p>';
    api('/api/music-play',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({channelId:vc,query:t.url})}).then(function(r){
     o.innerHTML=r.error?'<p class="err">❌ '+esc(r.error)+'</p>':'<p class="ok">✅ Now playing: <b>'+esc(r.track.title)+'</b>'+(r.queued?' (queued #'+r.queued+')':'')+'</p>';load()})};
   d.appendChild(im);d.appendChild(tx);d.appendChild(b);rs.appendChild(d)})})};
// voice host test
var vt=document.getElementById('vtest');
if(vt)vt.onclick=function(){var o=document.getElementById('mpout');o.innerHTML='<p style="color:var(--dim)">🩺 Voice connection test ho raha hai...</p>';
 api('/api/voice-test',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({})}).then(function(r){
  o.innerHTML=r.ok?'<p class="ok">✅ Voice OK is host pe ('+esc(r.channel)+') — music chalega!</p>':'<p class="err">❌ '+esc(r.error)+'</p>'})};
// soundboard
if(document.getElementById('svchan'))api('/api/voicechannels').then(function(vcs){var o='';vcs.forEach(function(c){o+='<option value="'+c.id+'">🔊 '+esc(c.name)+'</option>'});var v=document.getElementById('svchan');if(v)v.innerHTML=o});
document.querySelectorAll('.sbtn').forEach(function(b){b.onclick=function(){var vc=document.getElementById('svchan');var o=document.getElementById('sout');
 b.classList.add('playing');setTimeout(function(){b.classList.remove('playing')},600);
 api('/api/sound-play',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({channelId:vc?vc.value:'',sound:b.dataset.s})}).then(function(r){if(o)o.innerHTML=r.error?'<p class="err">❌ '+esc(r.error)+'</p>':'<p class="ok">🔊 '+esc(b.querySelector('span').textContent)+' baj raha hai!</p>'})}});
// bot profile
api('/api/botprofile').then(function(p){var n=document.getElementById('bname');if(!n)return;
 n.value=p.username;document.getElementById('bstat').value=p.statusText||'⛏️ play.rizokmc.fun';document.getElementById('btype').value=p.statusType;document.getElementById('bpres').value=p.presence;document.getElementById('bbio').value=p.bio;
 var av=document.getElementById('bpav');if(av&&p.avatar)av.src=p.avatar;var tg=document.getElementById('btag');if(tg)tg.textContent=p.username;var bl=document.getElementById('bbioline');if(bl)bl.textContent=p.bio||'No bio set yet'});
var bsv=document.getElementById('bsave');
if(bsv)bsv.onclick=function(){api('/api/botprofile',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username:document.getElementById('bname').value,statusText:document.getElementById('bstat').value,statusType:document.getElementById('btype').value,presence:document.getElementById('bpres').value,bio:document.getElementById('bbio').value})}).then(function(r){
 var o=document.getElementById('bout');o.innerHTML=r.ok?'<p class="ok">✅ Bot profile updated!</p>':'<p class="err">⚠️ Partially saved: '+esc((r.errors||[]).join(' • '))+'</p>'})};
var as=document.getElementById('asend');if(as)as.onclick=function(){api('/api/announce',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({channelId:document.getElementById('achan').value,content:composerText()})}).then(function(r){document.getElementById('aout').innerHTML=r.ok?'<p class="ok">✅ Announcement sent!</p>':'<p class="err">❌ '+(r.error||'failed')+'</p>'})};
var mv=document.getElementById('msave');if(mv)mv.onclick=function(){var b={};document.querySelectorAll('#toggles input').forEach(function(i){b[i.dataset.k]=i.checked});api('/api/automod',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(b)}).then(function(r){document.getElementById('mout').innerHTML=r.ok?'<p class="ok">✅ Saved!</p>':'<p class="err">❌ failed</p>'})};
var wv=document.getElementById('wsave');if(wv)wv.onclick=function(){api('/api/welcome',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({message:document.getElementById('wmsg').value,channel:document.getElementById('wchan').value})}).then(function(r){document.getElementById('wout').innerHTML=r.ok?'<p class="ok">✅ Saved!</p>':'<p class="err">❌ failed</p>'})};
var wt=document.getElementById('wtest');if(wt)wt.onclick=function(){api('/api/welcome-test',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({})}).then(function(r){document.getElementById('wout').innerHTML=r.ok?'<p class="ok">✅ Test welcome bheja!</p>':'<p class="err">❌ '+(r.error||'failed')+'</p>'})};
document.querySelectorAll('[data-m]').forEach(function(b){b.onclick=function(){api('/api/music',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:b.dataset.m})}).then(load)}});
load();setInterval(load,20000);
</script></body></html>`;
}

export function startWeb(botClient) {
  client = botClient;
  const port = Number(process.env.PORT || 8080);
  app.listen(port, '0.0.0.0', () => console.log(`🌐 RizokMC dashboard on port ${port}`));
}
