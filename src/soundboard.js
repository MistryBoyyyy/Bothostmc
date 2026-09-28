// ══════════════════════════════════════════════════════════════
//  SOUNDBOARD — play SFX clips into any voice channel (web control)
// ══════════════════════════════════════════════════════════════
import fs from 'fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  joinVoiceChannel, createAudioResource, createAudioPlayer,
  VoiceConnectionStatus, entersState,
} from '@discordjs/voice';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const SOUNDS = [
  { key: 'xp', name: 'XP Orb', icon: 'star' },
  { key: 'levelup', name: 'Level Up', icon: 'trophy' },
  { key: 'coin', name: 'Coin', icon: 'coin' },
  { key: 'pop', name: 'Pop', icon: 'party_balloon' },
  { key: 'click', name: 'Click', icon: 'misc_check' },
  { key: 'boom', name: 'Explosion', icon: 'tnt' },
  { key: 'creeper', name: 'Creeper Sss', icon: 'creeper' },
  { key: 'glass', name: 'Glass Break', icon: 'item_ice' },
  { key: 'anvil', name: 'Anvil', icon: 'ingot_iron' },
  { key: 'tada', name: 'Ta-Da!', icon: 'gift' },
  { key: 'oof', name: 'Oof', icon: 'face_sad' },
  { key: 'laser', name: 'Laser', icon: 'bolt' },
  { key: 'horn', name: 'Air Horn', icon: 'face_hype' },
  { key: 'sad', name: 'Sad Trombone', icon: 'face_cry' },
  { key: 'door', name: 'Door Creak', icon: 'lock' },
  { key: 'eat', name: 'Nom Nom', icon: 'star' },
];

let conn = null;
let player = null;

export async function playSound(guild, channelId, key) {
  const file = path.join(__dirname, '..', 'assets', 'sounds', `${key}.wav`);
  if (!fs.existsSync(file)) return { error: 'Unknown sound.' };
  const vc = guild.channels.cache.get(channelId);
  if (!vc || !vc.isVoiceBased()) return { error: 'Pick a valid voice channel.' };
  try {
    if (!conn || conn.joinConfig.channelId !== vc.id || conn.state.status === VoiceConnectionStatus.Destroyed) {
      conn?.destroy();
      conn = joinVoiceChannel({ channelId: vc.id, guildId: guild.id, adapterCreator: guild.voiceAdapterCreator, selfDeaf: false });
      await entersState(conn, VoiceConnectionStatus.Ready, 15_000);
    }
    if (!player) player = createAudioPlayer();
    conn.subscribe(player);
    player.play(createAudioResource(file));
    return { ok: true, sound: key };
  } catch (e) {
    console.error('[soundboard] play failed:', e.message);
    conn?.destroy(); conn = null;
    return { error: '🔇 Discord voice (UDP) is hosting platform pe blocked hai — music/sounds ke liye UDP-open host chahiye (VPS/Render). Dashboard, emojis, automod sab yahan fully working hain.' };
  }
}
