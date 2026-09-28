import { EmbedBuilder, Colors } from 'discord.js';
import { getGuildConfig } from './store.js';

// Send an embed to the configured mod-log channel (if set).
export async function logToModlog(guild, { title, description, color = Colors.Blue, fields = [], footer }) {
  const cfg = getGuildConfig(guild.id);
  if (!cfg.modlog) return;
  const channel = guild.channels.cache.get(cfg.modlog) ?? (await guild.channels.fetch(cfg.modlog).catch(() => null));
  if (!channel?.isTextBased()) return;

  const embed = new EmbedBuilder()
    .setTitle(title)
    .setColor(color)
    .setTimestamp();
  if (description) embed.setDescription(description);
  if (fields.length) embed.addFields(fields);
  if (footer) embed.setFooter({ text: footer });
  await channel.send({ embeds: [embed] }).catch(() => {});
}

export function fmtUser(user) {
  return `${user.tag ?? user.username} (\`${user.id}\`)`;
}

export function safeReason(reason) {
  return reason && reason.trim() ? reason.trim() : 'No reason provided';
}
