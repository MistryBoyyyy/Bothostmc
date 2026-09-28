// Anti-spam / anti-mention-spam / anti-raid helpers
import { Colors } from 'discord.js';
import { getGuildConfig } from './store.js';
import { logToModlog, fmtUser } from './util.js';

// userId -> [timestamps]
const messageTimes = new Map();
// userId -> join timestamp (for raid detection)
const joinTimes = new Map();

export async function handleMessage(message) {
  if (!message.guild || message.author.bot) return;

  const cfg = getGuildConfig(message.guild.id);

  // --- Anti mention-spam ---
  if (cfg.antimention) {
    const mentions =
      message.mentions.users.size + message.mentions.roles.size;
    if (mentions >= cfg.maxMentions) {
      await punish(message, `Mass mentions (${mentions})`, cfg);
      return;
    }
  }

  // --- Anti spam (rapid messages) ---
  if (cfg.antispam) {
    const now = Date.now();
    const times = (messageTimes.get(message.author.id) ?? []).filter(
      (t) => now - t < cfg.antispamWindow
    );
    times.push(now);
    messageTimes.set(message.author.id, times);

    if (times.length >= cfg.antispamThreshold) {
      messageTimes.delete(message.author.id);
      await punish(message, `Spamming (${times.length} messages in ${cfg.antispamWindow / 1000}s)`, cfg);
    }
  }
}

async function punish(message, why, cfg) {
  const member = message.member;
  if (!member || member.permissions.has('Administrator')) return;

  let punished = false;
  if (member.moderatable) {
    try {
      await member.timeout(cfg.antispamTimeout, `MC-Security auto-mod: ${why}`);
      punished = true;
    } catch {
      punished = false;
    }
  }

  await message.delete().catch(() => {});
  await message.channel
    .send(
      `⚠️ <@${message.author.id}> ${punished ? `has been timed out for ${cfg.antispamTimeout / 1000}s` : 'was warned'} — ${why}.`
    )
    .catch(() => {});

  await logToModlog(message.guild, {
    title: '🛡️ Auto-Moderation',
    description: `**User:** ${fmtUser(message.author)}\n**Action:** ${punished ? `Timeout ${cfg.antispamTimeout / 1000}s` : 'None (missing perms)'}\n**Reason:** ${why}`,
    color: Colors.Orange,
  });
}

// Simple anti-raid: many joins in a short window -> alert modlog
export async function handleMemberAdd(member) {
  const now = Date.now();
  const arr = (joinTimes.get(member.guild.id) ?? []).filter((t) => now - t < 10_000);
  arr.push(now);
  joinTimes.set(member.guild.id, arr);

  if (arr.length >= 5) {
    joinTimes.delete(member.guild.id);
    await logToModlog(member.guild, {
      title: '🚨 Possible Raid',
      description: `${arr.length} members joined within 10 seconds. Consider enabling verification or lockdown.`,
      color: Colors.Red,
    });
  }
}
