// Shared IP embed (used by /ip and chat auto-reply)
import { EmbedBuilder, Colors } from 'discord.js';
import { getGuildConfig } from './store.js';
import E from './premium.js';

export function buildIpEmbed(guild) {
  const cfg = getGuildConfig(guild.id);
  const ip = cfg.ip ?? 'play.rizokmc.fun';

  const embed = new EmbedBuilder()
    .setColor(Colors.Green)
    .setAuthor({ name: 'R I Z O K M C ・ S E R V E R ・ I P' })
    .setDescription(
      `${E.pgem} ─────────────────────────────\n` +
      `${E.ppick}  **IP** ❯ \`${ip}\`\n` +
      `${E.pfire}  **Bedrock Port** ❯ \`19132\`\n` +
      `${E.psparkle} ─────────────────────────────\n` +
      `*Copy the IP, join the server and enjoy!* ${E.pcrown}`
    )
    .setFooter({ text: 'RizokMC' })
    .setTimestamp();
  if (E.banner_server) embed.setImage(E.banner_server);
  return embed;
}
