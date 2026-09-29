// All-in-one AutoMod: anti-IP, anti-badwords (Hinglish+English), anti-social-links,
// anti-invite, anti-link, anti-caps, images-off + detailed modlog.
import { Colors, PermissionFlagsBits } from 'discord.js';
import { getGuildConfig } from './store.js';
import { logToModlog, fmtUser } from './util.js';

// ---------- Badwords: Hinglish + English, big & small ----------
const BADWORDS = [
  // hinglish
  'bc', 'bsdk', 'bskd', 'b s d k', 'bhosda', 'bhosdi', 'bhosdike', 'bhosdi ke', 'bhodike', 'bhosda ke',
  'chutiya', 'chutiye', 'chutiyo', 'chutiyapan', 'chut', 'choot', 'chutia', 'chutiya ke',
  'loda', 'lodu', 'lodu ram', 'lund', 'laude', 'lawde', 'lode', 'lund le', 'lund teri',
  'madarchod', 'maderchod', 'macarchod', 'madar chod', 'maa ki chut', 'maaki chut', 'maa chuda',
  'maa chudwa', 'maa ke chut', 'mkc', 'mkb', 'mkbc', 'm k c',
  'randi', 'randwe', 'randi ke', 'rondi', 'chinal', 'chinaal',
  'gandu', 'gand', 'gaand', 'gaand me', 'gand me', 'gand mara', 'gand marwa', 'gand fat',
  'behanchod', 'behenchod', 'bhenchod', 'bhen ke lode', 'behen ke lode', 'behanchod ke', 'betichod',
  'chod', 'chodu', 'chod dunga', 'chod diya',
  'harami', 'haramzada', 'harami ke', 'kamina', 'kamini',
  'kutta', 'kutti', 'kutte', 'kutte ke',
  'sale', 'saale', 'salaa', 'sala',
  'tatti', 'potti', 'chumtiya', 'chumti', 'dalle', 'dalli', 'hijda', 'hijde', 'nalle', 'nalli',
  'bhadwa', 'bhadwe', 'bhadve', 'jhatu', 'jhaatu', 'chakka',
  'teri maa ki', 'teri behen ki', 'teri maa ki chut',
  // english
  'nigger', 'nigga', 'faggot', 'retard', 'bitch', 'b tch', 'bitches', 'cunt', 'cunts',
  'dick', 'dickhead', 'dicks', 'pussy', 'whore', 'slut', 'sluts', 'bastard', 'asshole',
  'ass hole', 'shit', 'bullshit', 'fuck', 'fucking', 'fucked', 'motherfucker', 'mf', 'wanker',
  'porn', 'hentai', 'xxx',
];
const BAD_RES = BADWORDS.map((w) => new RegExp(`\\b${w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i'));

// ---------- Patterns ----------
const IPV4_RE = /\b((25[0-5]|2[0-4]\d|1?\d?\d)\.){3}(25[0-5]|2[0-4]\d|1?\d?\d)\b/;
const MC_ADDR_RE = /\b(play|mc|hub|join|connect|bed|smp)\.[a-z0-9][a-z0-9-]*(\.[a-z0-9-]+)+\b/i;
const ADDR_PORT_RE = /\b[a-z0-9][a-z0-9.-]*\.[a-z]{2,}:\d{2,5}\b/i;
const SOCIAL_RE = /(youtube\.com|youtu\.be|instagram\.com|instagr\.am)/i;
const INVITE_RE = /(discord\.(gg|io|me|li)|discordapp\.com\/invite)\/\S+/i;
const LINK_RE = /(https?:\/\/|www\.)\S+/i;
const IMAGE_EXT = /\.(png|jpe?g|gif|webp|bmp|avif|heic)\b/i;

// strikes: "guild:user" -> { count, ts }
const strikes = new Map();
// message ids deleted by automod (so generic MessageDelete log doesn't double-log)
export const recentAutoDeletes = new Set();

export function isStaff(member) {
  if (!member) return false;
  if (member.permissions.has('Administrator') || member.permissions.has('ManageMessages')) return true;
  const staffRoles = getGuildConfig(member.guild.id).ticketStaffRoles ?? [];
  return member.roles.cache.some((r) => staffRoles.includes(r.id));
}

function normalize(text) {
  return text.toLowerCase().replace(/[^a-z\s]/g, ' ').replace(/\s+/g, ' ').trim();
}

export function findBadword(content) {
  const norm = normalize(content);
  const noPunct = content.toLowerCase().replace(/[^a-z\s]/g, ''); // catches b.h.o.s.d.i.k.e
  for (let i = 0; i < BADWORDS.length; i++) {
    if (BAD_RES[i].test(norm) || BAD_RES[i].test(noPunct)) return BADWORDS[i];
  }
  return null;
}

export function findIp(content) {
  if (/rizokmc/i.test(content)) return null; // own server is allowed
  if (IPV4_RE.test(content)) return content.match(IPV4_RE)[0];
  if (MC_ADDR_RE.test(content)) return content.match(MC_ADDR_RE)[0];
  if (ADDR_PORT_RE.test(content)) return content.match(ADDR_PORT_RE)[0];
  return null;
}

async function act(message, { why, timeoutMs = 0, emoji = '🛡️' }) {
  recentAutoDeletes.add(message.id);
  setTimeout(() => recentAutoDeletes.delete(message.id), 60_000);
  await message.delete().catch(() => {});
  let action = 'Message deleted';
  if (timeoutMs && message.member?.moderatable) {
    await message.member.timeout(timeoutMs, `AutoMod: ${why}`).catch(() => {});
    action = `Message deleted + ${Math.round(timeoutMs / 1000)}s timeout`;
  }
  await message.channel
    .send(`${emoji} <@${message.author.id}> — removed: **${why}**${timeoutMs ? ` (${Math.round(timeoutMs / 1000)}s timeout)` : ''}.`)
    .then((m) => setTimeout(() => m.delete().catch(() => {}), 15000))
    .catch(() => {});
  await logToModlog(message.guild, {
    title: `${emoji} AutoMod — ${why}`,
    description:
      `**User:** ${fmtUser(message.author)}\n` +
      `**Channel:** ${message.channel} (${message.channel.name})\n` +
      `**Action:** ${action}\n` +
      `**Reason:** ${why}\n` +
      `**Deleted message:** \`${(message.content || '(attachment)').slice(0, 500)}\``,
    color: Colors.Red,
  });
  return action;
}

export async function handleAutomod(message) {
  if (!message.guild || message.author.bot) return;
  const member = message.member;
  if (!member || isStaff(member)) return;

  const cfg = getGuildConfig(message.guild.id);

  // ---- images/attachments off (backup of permission lock) ----
  if (message.attachments?.size) {
    const hasImage = [...message.attachments.values()].some(
      (a) => (a.contentType ?? '').startsWith('image') || IMAGE_EXT.test(a.name ?? ''),
    );
    if (hasImage) return act(message, { why: 'Images are disabled in this server', emoji: '🖼️' });
  }

  // ---- IP advertising: instant delete + 2 min timeout ----
  const ip = findIp(message.content ?? '');
  if (ip) return act(message, { why: `Server IP not allowed (${ip})`, timeoutMs: 120_000, emoji: '🌐' });

  // ---- badwords: delete + strike; 2nd strike = 2 min timeout ----
  const bad = cfg.antibadwords ? findBadword(message.content ?? '') : null;
  if (bad) {
    const key = `${message.guild.id}:${message.author.id}`;
    const s = strikes.get(key);
    const now = Date.now();
    const count = s && now - s.ts < 10 * 60_000 ? s.count + 1 : 1;
    strikes.set(key, { count, ts: now });
    if (count >= 2) {
      strikes.delete(key);
      return act(message, { why: `Inappropriate language "${bad}" (2nd warning)`, timeoutMs: 120_000, emoji: '🤬' });
    }
    return act(message, { why: `Inappropriate language "${bad}" (warning 1/2)`, emoji: '🤬' });
  }

  // ---- youtube / instagram links ----
  if (SOCIAL_RE.test(message.content ?? '')) {
    return act(message, { why: 'YouTube/Instagram links are not allowed', emoji: '🔗' });
  }

  // ---- discord invites ----
  if (cfg.antiinvite && INVITE_RE.test(message.content ?? '')) {
    return act(message, { why: 'Discord server invite', timeoutMs: 60_000 });
  }

  // ---- any other link ----
  if (cfg.antilink && LINK_RE.test(message.content ?? '')) {
    return act(message, { why: 'Links are not allowed', timeoutMs: 60_000 });
  }

  // ---- anti-caps ----
  if (cfg.anticaps && (message.content ?? '').length >= 20) {
    const letters = message.content.replace(/[^a-zA-Z]/g, '');
    const caps = message.content.replace(/[^A-Z]/g, '');
    if ((letters.length >= 12 && caps.length / letters.length > 0.7) || /[A-Z]{12,}/.test(message.content)) {
      return act(message, { why: 'Excessive CAPS' });
    }
  }
}

// Read-only boards: members can look and react, but cannot type.
const READONLY_CHANNELS = new Set([
  '1539608011780268082', // welcome
  '1539608012354879550', // invites
  '1539608024497393715', // boosts
  '1539608021834010706', // giveaway
  '1539608015068729384', // information
  '1539608016100270151', // announcement
  '1539608038162432062', // ticket panel
  '1554191163295010848', // ranks store
]);
// Hidden from everyone except the team. Private support-* tickets are NOT in here.
const STAFF_CATEGORY = '1539608009859137566';
const STAFF_CHAT = '1539608034811183175';
const STAFF_VOICE = '1539608036673323139';
const TEAM_ROLES = [
  '1553425480609173545', // owner
  '1553425479678304326', // co-owner
  '1553430283657805854', // security
  '1553425477962563614', // developer
  '1553425477031432302', // staff
  '1553425476272521256', // helper
];
// Staff voice only — not staff chat, not modlogs.
const YOUTUBER_ROLES = ['1554520586309341281'];

function noChat() {
  return {
    ViewChannel: true,
    ReadMessageHistory: true,
    AddReactions: true,
    SendMessages: false,
    SendTTSMessages: false,
    SendVoiceMessages: false,
    SendPolls: false,
    CreatePublicThreads: false,
    CreatePrivateThreads: false,
    SendMessagesInThreads: false,
    AttachFiles: false,
  };
}

// ---------- Images-off + channel layout sweep ----------
export async function applyImageLock(guild) {
  const cfg = getGuildConfig(guild.id);
  const staffIds = new Set([...(cfg.ticketStaffRoles ?? []), ...TEAM_ROLES]);
  const roles = [...guild.roles.cache.values()].filter((r) => staffIds.has(r.id));
  const main = guild.id === '1539606347513860186';
  let locked = 0;
  for (const ch of guild.channels.cache.values()) {
    if (ch.type >= 10 && ch.type <= 12) continue; // skip threads
    const hidden = main && (ch.id === STAFF_CATEGORY || ch.id === STAFF_CHAT || ch.id === STAFF_VOICE || ch.id === cfg.modlog || ch.parentId === STAFF_CATEGORY);
    const readonly = main && READONLY_CHANNELS.has(ch.id);
    const text = ch.isTextBased?.() && ch.type !== 4;
    if (!text && !hidden) continue;
    try {
      if (hidden) {
        await ch.permissionOverwrites.edit(guild.id, {
          ViewChannel: false,
          Connect: false,
          SendMessages: false,
          AddReactions: false,
          AttachFiles: false,
        }, { type: 0, reason: 'RizokMC: staff-only' });
        const voice = ch.type === 2 || ch.type === 13;
        const modlog = ch.id === cfg.modlog;
        for (const r of roles) {
          await ch.permissionOverwrites.edit(r.id, voice ? {
            ViewChannel: true, Connect: true, Speak: true, Stream: true, UseVAD: true,
            SendMessages: true, ReadMessageHistory: true, AttachFiles: true,
          } : modlog ? {
            ViewChannel: true, ReadMessageHistory: true, SendMessages: false, AttachFiles: false, AddReactions: false,
          } : {
            ViewChannel: true, SendMessages: true, ReadMessageHistory: true,
            AttachFiles: true, EmbedLinks: true, AddReactions: true, UseExternalEmojis: true,
          }, { type: 0, reason: 'RizokMC: staff can see' }).catch(() => {});
        }
        if (ch.id === STAFF_VOICE) {
          for (const id of YOUTUBER_ROLES) {
            await ch.permissionOverwrites.edit(id, {
              ViewChannel: true, Connect: true, Speak: true, Stream: true, UseVAD: true,
              SendMessages: true, ReadMessageHistory: true, AttachFiles: true,
            }, { type: 0, reason: 'RizokMC: youtuber staff VC' }).catch(() => {});
          }
        }
      } else if (readonly) {
        await ch.permissionOverwrites.edit(guild.id, noChat(), { type: 0, reason: 'RizokMC: read-only board' });
      } else if (text && !String(ch.name).startsWith('support-')) {
        const everyoneDeny = { AttachFiles: false };
        if (cfg.modlog && ch.id === cfg.modlog) {
          everyoneDeny.SendMessages = false;
          everyoneDeny.AddReactions = false;
        }
        await ch.permissionOverwrites.edit(guild.id, everyoneDeny, { type: 0, reason: 'RizokMC: images off' });
        for (const r of roles) {
          await ch.permissionOverwrites.edit(r.id, { AttachFiles: true }, { type: 0, reason: 'RizokMC: staff images allowed' }).catch(() => {});
        }
      }
      locked++;
    } catch { /* missing access on some channels */ }
  }
  return locked;
}
