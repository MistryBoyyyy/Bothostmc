// Persistent server timers (survive restarts) — ported concept from Falcon-Premium
import { getTimers, saveTimers, removeTimer } from './store.js';
import E from './premium.js';

const TICK = 5000;

export function fmtDuration(ms) {
  const s = Math.max(0, Math.round(ms / 1000));
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const parts = [];
  if (d) parts.push(`${d}d`);
  if (h) parts.push(`${h}h`);
  if (m) parts.push(`${m}m`);
  if (sec || !parts.length) parts.push(`${sec}s`);
  return parts.join(' ');
}

export function startTimerChecker(client) {
  setInterval(() => {
    const list = getTimers();
    let changed = false;
    for (const t of list) {
      if (t.paused) continue;
      t.remainingMs -= TICK;
      changed = true;
      if (t.remainingMs <= 0) {
        removeTimer(t.id);
        client.channels.fetch(t.channelId).then(async (ch) => {
          await ch?.send(`${E.ptrophy} ${E.phourglass} **TIMER FINISHED:** \`${t.name}\`${t.note ? ` — ${t.note}` : ''}\nStarted by <@${t.createdBy}> • lasted ${fmtDuration(t.totalMs)}`).catch(() => {});
        }).catch(() => {});
        continue;
      }
    }
    if (changed) saveTimers(list.filter((t) => t.remainingMs > 0 || t.paused));
  }, TICK);
  console.log('[timers] checker started');
}
