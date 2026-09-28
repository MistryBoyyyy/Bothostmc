// Simple JSON persistence for warnings + guild settings + invites + giveaways
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = process.env.MC_DATA_DIR || path.join(__dirname, '..', 'data');

function ensureDir() {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
}

function load(file, fallback) {
  ensureDir();
  const p = path.join(DATA_DIR, file);
  if (!existsSync(p)) return fallback;
  try {
    return JSON.parse(readFileSync(p, 'utf8'));
  } catch {
    return fallback;
  }
}

function save(file, data) {
  ensureDir();
  writeFileSync(path.join(DATA_DIR, file), JSON.stringify(data, null, 2));
}

// ---------- Warnings ----------
export function getWarnings(guildId, userId) {
  const db = load('warnings.json', {});
  return db[guildId]?.[userId] ?? [];
}

export function addWarning(guildId, userId, { reason, moderator }) {
  const db = load('warnings.json', {});
  db[guildId] ??= {};
  db[guildId][userId] ??= [];
  const id = (db[guildId][userId].length + 1).toString();
  const warn = { id, reason, moderator, timestamp: Date.now() };
  db[guildId][userId].push(warn);
  save('warnings.json', db);
  return warn;
}

export function removeWarning(guildId, userId, warnId) {
  const db = load('warnings.json', {});
  const list = db[guildId]?.[userId];
  if (!list) return false;
  const idx = list.findIndex((w) => w.id === warnId);
  if (idx === -1) return false;
  list.splice(idx, 1);
  save('warnings.json', db);
  return true;
}

// ---------- Guild settings ----------
const DEFAULTS = {
  modlog: null,
  antispam: true,
  antimention: true,
  antispamThreshold: 5,
  antispamWindow: 4000,
  antispamTimeout: 60_000,
  maxMentions: 5,
  welcomeChannel: null,
  welcomeMessage: 'Welcome {user} to **{server}**! 🎉\nYou are member **#{count}**.\n{inviterline}',
  autorole: null,
  ticketCategory: null,
  ticketStaffRoles: [],
  ip: 'play.rizokmc.fun',
  antilink: true,
  antiinvite: true,
  antibadwords: true,
  anticaps: false,
  antinuke: true,
  badwords: [],
  nukeWhitelist: [],
};

export function getGuildConfig(guildId) {
  const db = load('guilds.json', {});
  return { ...DEFAULTS, ...(db[guildId] ?? {}) };
}

export function setGuildConfig(guildId, patch) {
  const db = load('guilds.json', {});
  db[guildId] = { ...DEFAULTS, ...(db[guildId] ?? {}), ...patch };
  save('guilds.json', db);
  return db[guildId];
}

// ---------- Invites ----------
// shape: { [guildId]: { [inviterId]: { total, left, codes: [] } } }
export function getInviterData(guildId, inviterId) {
  const db = load('invites.json', {});
  return db[guildId]?.[inviterId] ?? null;
}

export function recordInvite(guildId, inviterId, code) {
  const db = load('invites.json', {});
  db[guildId] ??= {};
  db[guildId][inviterId] ??= { total: 0, left: 0, codes: [] };
  const entry = db[guildId][inviterId];
  entry.total += 1;
  if (code && !entry.codes.includes(code)) entry.codes.push(code);
  save('invites.json', db);
  return entry;
}

export function recordLeave(guildId, inviteeId, inviterId) {
  const db = load('invites.json', {});
  const entry = db[guildId]?.[inviterId];
  if (!entry) return;
  entry.left += 1;
  save('invites.json', db);
}

export function getInviteLeaderboard(guildId) {
  const db = load('invites.json', {});
  const guild = db[guildId] ?? {};
  return Object.entries(guild)
    .map(([id, d]) => ({ id, ...d, net: d.total - d.left }))
    .sort((a, b) => b.net - a.net)
    .slice(0, 10);
}

// invitee -> inviter map (per guild) so we know who to credit on leave
export function setInviteeMap(guildId, inviteeId, inviterId) {
  const db = load('invite-map.json', {});
  db[guildId] ??= {};
  db[guildId][inviteeId] = inviterId;
  save('invite-map.json', db);
}

export function getInviterOf(guildId, inviteeId) {
  const db = load('invite-map.json', {});
  return db[guildId]?.[inviteeId] ?? null;
}

// ---------- Giveaways ----------
// shape: [ { messageId, channelId, guildId, endTime, prize, winners, hostId, ended } ]
export function getGiveaways() {
  return load('giveaways.json', []);
}

export function saveGiveaways(list) {
  save('giveaways.json', list);
}

export function addGiveaway(gw) {
  const list = getGiveaways();
  list.push(gw);
  saveGiveaways(list);
}

export function updateGiveaway(messageId, patch) {
  const list = getGiveaways();
  const gw = list.find((g) => g.messageId === messageId);
  if (!gw) return null;
  Object.assign(gw, patch);
  saveGiveaways(list);
  return gw;
}

// ---------- AFK ----------
export function setAfk(guildId, userId, reason) {
  const db = load('afk.json', {});
  db[guildId] ??= {};
  db[guildId][userId] = { reason, since: Date.now() };
  save('afk.json', db);
}

export function getAfk(guildId, userId) {
  const db = load('afk.json', {});
  return db[guildId]?.[userId] ?? null;
}

export function removeAfk(guildId, userId) {
  const db = load('afk.json', {});
  if (!db[guildId]?.[userId]) return null;
  const data = db[guildId][userId];
  delete db[guildId][userId];
  save('afk.json', db);
  return data;
}

// ---------- Message tracking ----------
// shape: { [guildId]: { [userId]: { total, days: { 'YYYY-MM-DD': n } } } }
export function recordMessage(guildId, userId) {
  const db = load('messages.json', {});
  db[guildId] ??= {};
  db[guildId][userId] ??= { total: 0, days: {} };
  const e = db[guildId][userId];
  const day = new Date().toISOString().slice(0, 10);
  e.total += 1;
  e.days[day] = (e.days[day] ?? 0) + 1;
  // keep only last 7 days
  const keys = Object.keys(e.days).sort();
  while (keys.length > 7) delete e.days[keys.shift()];
  save('messages.json', db);
}

export function getMessageStats(guildId, userId) {
  const db = load('messages.json', {});
  const e = db[guildId]?.[userId];
  const day = new Date().toISOString().slice(0, 10);
  return { total: e?.total ?? 0, today: e?.days?.[day] ?? 0 };
}

export function getMessageLeaderboard(guildId, { daily = false, limit = 10 } = {}) {
  const db = load('messages.json', {});
  const day = new Date().toISOString().slice(0, 10);
  return Object.entries(db[guildId] ?? {})
    .map(([id, e]) => ({ id, total: e.total, today: e.days?.[day] ?? 0, score: daily ? (e.days?.[day] ?? 0) : e.total }))
    .filter((e) => e.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

// ---------- Timers ----------
// shape: [ { id, guildId, channelId, name, totalMs, remainingMs, paused, createdBy, note } ]
export function getTimers() {
  return load('timers.json', []);
}

export function saveTimers(list) {
  save('timers.json', list);
}

export function addTimer(t) {
  const list = getTimers();
  list.push(t);
  saveTimers(list);
}

export function findTimer(guildId, name) {
  return getTimers().find((t) => t.guildId === guildId && t.name.toLowerCase() === name.toLowerCase());
}

export function updateTimer(id, patch) {
  const list = getTimers();
  const t = list.find((x) => x.id === id);
  if (!t) return null;
  Object.assign(t, patch);
  saveTimers(list);
  return t;
}

export function removeTimer(id) {
  const list = getTimers().filter((t) => t.id !== id);
  saveTimers(list);
}

// ---------- Invites management (manual adjust) ----------
export function adjustInvites(guildId, userId, delta) {
  const db = load('invites.json', {});
  db[guildId] ??= {};
  db[guildId][userId] ??= { total: 0, left: 0, codes: [] };
  db[guildId][userId].total = Math.max(0, db[guildId][userId].total + delta);
  save('invites.json', db);
  return db[guildId][userId];
}

export function resetInvites(guildId, userId) {
  const db = load('invites.json', {});
  if (db[guildId]?.[userId]) {
    db[guildId][userId] = { total: 0, left: 0, codes: [] };
    save('invites.json', db);
  }
}

export function recordFake(guildId, inviterId) {
  const db = load('invites.json', {});
  db[guildId] ??= {};
  db[guildId][inviterId] ??= { total: 0, left: 0, codes: [] };
  db[guildId][inviterId].fake = (db[guildId][inviterId].fake ?? 0) + 1;
  save('invites.json', db);
}
