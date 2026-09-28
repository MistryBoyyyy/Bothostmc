// RizokMC Music engine — yt-dlp extraction + @discordjs/voice playback
import { spawn, spawnSync } from 'node:child_process';
import { existsSync, chmodSync, mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import {
  joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus,
  NoSubscriberBehavior, VoiceConnectionStatus, entersState, StreamType,
} from '@discordjs/voice';
import { EmbedBuilder, Colors } from 'discord.js';
import E from './premium.js';

const sessions = new Map(); // guildId -> session

function getSession(guildId) {
  if (!sessions.has(guildId)) {
    const player = createAudioPlayer({ behaviors: { noSubscriberBehavior: NoSubscriberBehavior.Pause } });
    const s = { queue: [], current: null, connection: null, player, textCh: null, volume: 0.8, leaveTimer: null, proc: null };
    player.on(AudioPlayerStatus.Idle, () => { s.proc?.kill?.(); nextTrack(guildId); });
    sessions.set(guildId, s);
  }
  return sessions.get(guildId);
}

export function musicSession(guildId) { return sessions.get(guildId); }

// ---------- yt-dlp binary management ----------
import os from 'node:os';

let ytdlpPath = null;
export async function ensureYtDlp() {
  if (ytdlpPath === 'yt-dlp' || (ytdlpPath && existsSync(ytdlpPath))) return ytdlpPath;
  const hasPy = !spawnSync('python3', ['--version']).error;
  const dirs = [path.join(process.cwd(), 'bin'), path.join(os.tmpdir(), 'rizokmc-bin')];
  for (const d of dirs) {
    if (hasPy && existsSync(path.join(d, 'yt-dlp'))) { ytdlpPath = path.join(d, 'yt-dlp'); try { chmodSync(ytdlpPath, 0o755); } catch {} return ytdlpPath; }
    if (existsSync(path.join(d, 'yt-dlp_linux'))) { ytdlpPath = path.join(d, 'yt-dlp_linux'); try { chmodSync(ytdlpPath, 0o755); } catch {} return ytdlpPath; }
  }
  if (!spawnSync('yt-dlp', ['--version']).error) { ytdlpPath = 'yt-dlp'; return ytdlpPath; }
  // download self-contained linux binary (no python needed)
  for (const d of dirs) {
    try {
      mkdirSync(d, { recursive: true });
      const p = path.join(d, 'yt-dlp_linux');
      const res = await fetch('https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp_linux');
      if (!res.ok) throw new Error('http ' + res.status);
      writeFileSync(p, Buffer.from(await res.arrayBuffer()));
      chmodSync(p, 0o755);
      ytdlpPath = p;
      console.log('[music] yt-dlp installed at', p);
      return p;
    } catch (e) { console.error('[music] yt-dlp download failed to', d, ':', e.message); }
  }
  throw new Error('yt-dlp unavailable on this host');
}

function ytdlp(args, timeoutMs = 25000) {
  return new Promise((resolve) => {
    ensureYtDlp().then((bin) => {
      const p = spawn(bin, ['--no-warnings', '--no-playlist', ...args]);
      let out = ''; let err = '';
      p.stdout.on('data', (c) => { out += c; });
      p.stderr.on('data', (c) => { err += c; });
      const t = setTimeout(() => p.kill(), timeoutMs);
      p.on('close', () => { clearTimeout(t); resolve({ out: out.trim(), err }); });
      p.on('error', () => { clearTimeout(t); resolve({ out: '', err: 'spawn failed' }); });
    });
  });
}

// ---------- search ----------
function mkTrack(line) {
  const [title, url, id, dur] = String(line).split('\t');
  if (!title || title === 'NA' || !url || url === 'NA') return null;
  const sec = parseInt(dur, 10) || 0;
  const m = Math.floor(sec / 60), s = sec % 60;
  return {
    title, url,
    thumbnail: id && id !== 'NA' ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg` : null,
    duration: sec, durationRaw: `${m}:${String(s).padStart(2, '0')}`,
  };
}
async function searchTrack(query) {
  const isUrl = /(youtube\.com|youtu\.be)\//i.test(query);
  const src = isUrl ? query : `ytsearch1:${query}`;
  const { out } = await ytdlp(['--print', '%(title)s\t%(webpage_url)s\t%(id)s\t%(duration)s', src], 60000);
  if (!out) return null;
  return mkTrack(out.split('\n')[0]);
}

export function musicEmbed({ title, desc, track, color = Colors.Purple, footer = 'RizokMC Music' }) {
  const em = new EmbedBuilder()
    .setColor(color)
    .setTitle(`${E.pmusic ?? '🎵'} ${title}`)
    .setTimestamp()
    .setFooter({ text: footer });
  if (desc) em.setDescription(desc);
  if (track) {
    em.addFields({ name: 'Track', value: `[${track.title.slice(0, 80)}](${track.url})`, inline: false });
    if (track.durationRaw) em.addFields({ name: 'Duration', value: `\`${track.durationRaw}\``, inline: true });
    if (track.requestedBy) em.addFields({ name: 'Requested by', value: `<@${track.requestedBy}>`, inline: true });
    if (track.thumbnail) em.setThumbnail(track.thumbnail);
  }
  return em;
}

async function connectTo(guild, vc) {
  const s = getSession(guild.id);
  if (!vc) return { fail: 'no-vc' };
  if (s.connection && s.connection.joinConfig.channelId === vc.id && s.connection.state.status !== VoiceConnectionStatus.Destroyed) return { s };
  s.connection?.destroy();
  s.connection = joinVoiceChannel({
    channelId: vc.id, guildId: guild.id, adapterCreator: guild.voiceAdapterCreator,
    selfDeaf: true,
  });
  try {
    await entersState(s.connection, VoiceConnectionStatus.Ready, 15_000);
  } catch (e) {
    console.error('[music] voice connect failed:', e.message);
    s.connection?.destroy(); s.connection = null;
    return { fail: 'connect-timeout' };
  }
  s.connection.subscribe(s.player);
  return { s };
}

async function connect(member) {
  const vc = member.voice.channel;
  if (!vc) return { fail: 'not-in-vc' };
  return connectTo(member.guild, vc);
}

async function nextTrack(guildId) {
  const s = getSession(guildId);
  const track = s.queue.shift();
  if (!track) {
    s.current = null;
    if (s.textCh) s.textCh.send({ embeds: [musicEmbed({ title: 'Queue finished!', desc: 'Use /play to add more music.', color: Colors.Greyple })] }).catch(() => {});
    clearTimeout(s.leaveTimer);
    s.leaveTimer = setTimeout(() => { s.connection?.destroy(); s.connection = null; }, 30_000);
    return;
  }
  clearTimeout(s.leaveTimer);
  s.current = track;
  try {
    const bin = await ensureYtDlp();
    s.proc?.kill?.();
    const proc = spawn(bin, ['-f', 'bestaudio/best', '-o', '-', track.url]);
    s.proc = proc;
    let failed = false;
    proc.stderr.on('data', (c) => { if (/ERROR/i.test(String(c))) failed = true; });
    proc.on('error', () => { failed = true; });
    const resource = createAudioResource(proc.stdout, { inputType: StreamType.Arbitrary, inlineVolume: true });
    resource.volume.setVolume(s.volume);
    s.resource = resource;
    s.player.play(resource);
    if (s.textCh) s.textCh.send({ embeds: [musicEmbed({ title: 'Now playing', track, color: Colors.Green })] }).catch(() => {});
    setTimeout(() => {
      if (failed && s.current === track) {
        s.textCh?.send({ embeds: [musicEmbed({ title: 'Stream error', desc: 'This track could not be played — please try another one.', color: Colors.Red })] }).catch(() => {});
        s.player.stop(true);
      }
    }, 4000);
  } catch (e) {
    console.error('music stream error:', e.message);
    if (s.textCh) s.textCh.send({ embeds: [musicEmbed({ title: 'Stream error', desc: 'This track could not be played — please try another one.', color: Colors.Red })] }).catch(() => {});
    nextTrack(guildId);
  }
}

export async function playTrack(member, query, textChannel) {
  try {
    const conn = await connect(member);
    if (conn.fail === 'not-in-vc') return { error: 'Join a voice channel first!' };
    if (conn.fail === 'connect-timeout') return { error: '🔇 Discord voice (UDP) is hosting platform pe blocked hai — music/sounds ke liye UDP-open host chahiye (VPS/Render). Dashboard, emojis, automod sab yahan fully working hain.' };
    const s = conn.s;
    s.textCh = textChannel;
    const track = await searchTrack(query);
    if (!track) return { error: 'No results found for that search.' };
    track.requestedBy = member.id;
    const wasIdle = !s.current && s.player.state.status === AudioPlayerStatus.Idle;
    s.queue.push(track);
    if (wasIdle) nextTrack(member.guild.id);
    return { track, queued: wasIdle ? 0 : s.queue.length };
  } catch (e) {
    console.error('[music] playTrack error:', e);
    return { error: `Music error: ${String(e.message).slice(0, 120)}` };
  }
}

export function skip(guildId) { const s = getSession(guildId); if (!s.current) return false; s.proc?.kill?.(); s.player.stop(true); return true; }

// ---------- website control: search + play into any voice channel ----------
export async function searchTracks(query, limit = 5) {
  const { out } = await ytdlp(['--print', '%(title)s\t%(webpage_url)s\t%(id)s\t%(duration)s', `ytsearch${limit}:${query}`], 60000);
  if (!out) return [];
  return out.split('\n').filter(Boolean).map(mkTrack).filter(Boolean);
}

export async function playInChannel(guild, channelId, query, textCh) {
  try {
    const vc = guild.channels.cache.get(channelId);
    if (!vc || !vc.isVoiceBased()) return { error: 'Pick a valid voice channel.' };
    const conn = await connectTo(guild, vc);
    if (conn.fail) return { error: '🔇 Discord voice (UDP) is hosting platform pe blocked hai — music/sounds ke liye UDP-open host chahiye (VPS/Render). Dashboard, emojis, automod sab yahan fully working hain.' };
    const s = conn.s;
    if (textCh) s.textCh = textCh;
    const track = await searchTrack(query);
    if (!track) return { error: 'No results found for that search.' };
    track.requestedBy = guild.client.user.id;
    const wasIdle = !s.current && s.player.state.status === AudioPlayerStatus.Idle;
    s.queue.push(track);
    if (wasIdle) nextTrack(guild.id);
    return { track, queued: wasIdle ? 0 : s.queue.length };
  } catch (e) {
    console.error('[music] playInChannel error:', e);
    return { error: `Music error: ${String(e.message).slice(0, 120)}` };
  }
}
export function pause(guildId) { return getSession(guildId).player.pause(); }
export function resume(guildId) { return getSession(guildId).player.unpause(); }
export function stopAll(guildId) {
  const s = getSession(guildId);
  s.queue = []; s.current = null;
  s.proc?.kill?.();
  s.player.stop(true);
  s.connection?.destroy(); s.connection = null;
  return true;
}
export function setVolume(guildId, vol) {
  const s = getSession(guildId);
  s.volume = vol / 100;
  if (s.resource?.volume) s.resource.volume.setVolume(s.volume);
  return true;
}
export function queueList(guildId) { const s = getSession(guildId); return { current: s.current, queue: s.queue.slice(0, 10), total: s.queue.length }; }
