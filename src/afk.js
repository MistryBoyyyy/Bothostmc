// AFK system: auto-reply when someone pings an AFK user; welcome-back on return
import { getAfk, removeAfk } from './store.js';

export async function handleAfkMessages(message) {
  if (!message.guild || message.author.bot) return;

  // User returned from AFK
  const selfAfk = removeAfk(message.guild.id, message.author.id);
  if (selfAfk) {
    const mins = Math.round((Date.now() - selfAfk.since) / 60000);
    await message.channel
      .send(`👋 Welcome back ${message.author}! You were AFK for ${mins < 1 ? 'a moment' : `${mins} min`}.`)
      .catch(() => {});
  }

  // Someone pinged an AFK user
  for (const [id, user] of message.mentions.users) {
    if (id === message.author.id) continue;
    const afk = getAfk(message.guild.id, id);
    if (afk) {
      const mins = Math.round((Date.now() - afk.since) / 60000);
      await message.channel
        .send(`💤 **${user.username}** is AFK${afk.reason ? ` — ${afk.reason}` : ''} (since ${mins < 1 ? 'just now' : `${mins} min ago`})`)
        .catch(() => {});
    }
  }
}
