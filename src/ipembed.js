// Shared IP embed (used by /ip and chat auto-reply)
import { EmbedBuilder, Colors } from 'discord.js';
import { getGuildConfig } from './store.js';
import E from './premium.js';

export function buildIpEmbed(guild) {
  const cfg = getGuildConfig(guild.id);
  const ip = cfg.ip ?? 'play.rizokmc.fun';
  const bedrockPort = cfg.bedrockPort ?? '25957';

  const embed = new EmbedBuilder()
    .setColor(Colors.Green)
    .setAuthor({ name: 'R I Z O K M C ・ S E R V E R ・ I P' })
    .setDescription(
      `${E.pgem} ─────────────────────────────\n` +
      `${E.ppick}  **Java IP** ❯ \`${ip}\`\n` +
      `${E.pfire}  **Bedrock IP** ❯ \`${ip}\`\n` +
      `${E.pfire}  **Bedrock Port** ❯ \`${bedrockPort}\`\n` +
      `${E.psparkle} ─────────────────────────────\n` +
      `*Java: just the IP. Bedrock: IP + port ${bedrockPort}.* ${E.pcrown}`
    )
    .setFooter({ text: 'RizokMC' })
    .setTimestamp();
  if (E.banner_server) embed.setImage(E.banner_server);
  return embed;
}
