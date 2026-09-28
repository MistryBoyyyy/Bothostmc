import {
  SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, Colors,
} from 'discord.js';
import { logToModlog, safeReason } from '../util.js';

export const data = new SlashCommandBuilder()
  .setName('timeout')
  .setDescription('Timeout (mute) a member')
  .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
  .addUserOption((o) => o.setName('user').setDescription('Member to timeout').setRequired(true))
  .addIntegerOption((o) =>
    o.setName('minutes').setDescription('Duration in minutes (max 40320 = 28 days)').setRequired(true).setMinValue(1).setMaxValue(40320)
  )
  .addStringOption((o) => o.setName('reason').setDescription('Reason'));

export async function execute(interaction) {
  const member = interaction.options.getMember('user');
  const minutes = interaction.options.getInteger('minutes');
  const reason = safeReason(interaction.options.getString('reason'));

  if (!member) {
    await interaction.reply({ content: '❌ That user is not in this server.', ephemeral: true });
    return;
  }
  if (!member.moderatable) {
    await interaction.reply({ content: '❌ I cannot moderate that member (role hierarchy).', ephemeral: true });
    return;
  }

  await member.timeout(minutes * 60_000, reason);

  const dm = new EmbedBuilder()
    .setColor(Colors.Orange)
    .setDescription(`🔇 You have been timed out in **${interaction.guild.name}** for ${minutes} minute(s).\n**Reason:** ${reason}`);
  await member.send({ embeds: [dm] }).catch(() => {});

  await interaction.reply({ content: `🔇 Timed out ${member} for ${minutes} minute(s) — ${reason}` });
  await logToModlog(interaction.guild, {
    title: '🔇 Timeout',
    description: `**User:** ${member.user.tag} (\`${member.id}\`)\n**Moderator:** ${interaction.user.tag}\n**Duration:** ${minutes} min\n**Reason:** ${reason}`,
    color: Colors.Orange,
  });
}
