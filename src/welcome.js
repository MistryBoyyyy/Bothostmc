// Welcome system — PREMIUM animated design
import { EmbedBuilder, Colors } from 'discord.js';
import { getGuildConfig } from './store.js';
import E from './premium.js';

export function buildWelcomeEmbed({ userMention, avatarUrl, serverName, count, inviterline, createdText, demo = false, serverIp = null, bedrockPort = null, fake = false }) {
  const embed = new EmbedBuilder()
    .setColor(Colors.Green)
    .setAuthor({ name: `W E L C O M E   T O   ${serverName.toUpperCase()}` });
  if (E.banner_welcome) embed.setImage(E.banner_welcome);
  embed.setThumbnail(avatarUrl)
    .setDescription(
      `${E.psparkle} ─────────────────────────────\n` +
      `${E.pcrown}  Hey ${userMention}! Welcome to **${serverName}**! ${E.pgem}\n` +
      `${E.pgift}  You are member **#${count}** — enjoy your stay!\n` +
      (fake ? `⚠️  *New account (< 7 days) — invite counted as fake.*\n` : '') +
      `${E.psparkle} ─────────────────────────────`
    )
    .addFields(
      { name: `${E.pgem} Total Members`, value: `${count}`, inline: true },
      { name: `${E.psparkle} Account Age`, value: createdText, inline: true },
      ...(serverIp ? [{ name: `${E.ppick} Server IP`, value: `\`${serverIp}\``, inline: true }] : []),
      ...(bedrockPort ? [{ name: `${E.pfire} Bedrock Port`, value: `\`${bedrockPort}\``, inline: true }] : []),
      { name: `${E.ptrophy} Invited By`, value: inviterline, inline: false }
    )
    .setFooter({ text: demo ? `${''}DEMO — real welcome messages look exactly like this` : 'RizokMC • Premium Welcomes' })
    .setTimestamp();
  return embed;
}

export async function handleWelcome(member, inviterInfo) {
  const cfg = getGuildConfig(member.guild.id);
  if (!cfg.welcomeChannel) return;

  const channel = member.guild.channels.cache.get(cfg.welcomeChannel)
    ?? (await member.guild.channels.fetch(cfg.welcomeChannel).catch(() => null));
  if (!channel?.isTextBased()) return;

  if (cfg.autorole) {
    const role = member.guild.roles.cache.get(cfg.autorole);
    if (role && member.manageable) {
      await member.roles.add(role, 'MC-Security autorole').catch(() => {});
    }
  }

  const inviterline = inviterInfo?.inviter
    ? `${inviterInfo.inviter}${inviterInfo.code ? ` (code \`${inviterInfo.code}\`)` : ''}`
    : 'Direct link / unknown invite';

  const DEFAULT_MSG = 'Welcome {user} to **{server}**! 🎉\nYou are member **#{count}**.\n{inviterline}';
  const embed = buildWelcomeEmbed({
    userMention: `<@${member.id}>`,
    avatarUrl: member.displayAvatarURL({ size: 256 }),
    serverName: member.guild.name,
    count: member.guild.memberCount,
    inviterline,
    createdText: `<t:${Math.floor(member.user.createdTimestamp / 1000)}:R>`,
    serverIp: cfg.ip,
    bedrockPort: cfg.bedrockPort ?? '25957',
    fake: inviterInfo?.fake ?? false,
  });

  // custom template overrides description only when admin changed it
  if (cfg.welcomeMessage && cfg.welcomeMessage !== DEFAULT_MSG) {
    const text = cfg.welcomeMessage
      .replace(/{user}/g, `<@${member.id}>`)
      .replace(/{name}/g, member.user.username)
      .replace(/{server}/g, member.guild.name)
      .replace(/{count}/g, member.guild.memberCount)
      .replace(/{inviterline}/g, inviterline);
    embed.setDescription(text);
  }

  await channel.send({ content: `<@${member.id}>`, embeds: [embed] }).catch((e) =>
    console.error('[welcome] send failed:', e.message)
  );
}

export async function handleGoodbye(member) {
  const cfg = getGuildConfig(member.guild.id);
  if (!cfg.welcomeChannel) return;
  const channel = member.guild.channels.cache.get(cfg.welcomeChannel);
  if (!channel?.isTextBased()) return;
  await channel
    .send(`${E.pfire} **${member.user.tag}** left the server. Now **${member.guild.memberCount}** members.`)
    .catch(() => {});
}
