import {
  SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, Colors,
} from 'discord.js';
import { addWarning } from '../store.js';
import { logToModlog, safeReason } from '../util.js';

export const data = new SlashCommandBuilder()
  .setName('warn')
  .setDescription('Warn a member')
  .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
  .addUserOption((o) => o.setName('user').setDescription('Member to warn').setRequired(true))
  .addStringOption((o) => o.setName('reason').setDescription('Reason for the warning'));

export async function execute(interaction) {
  const member = interaction.options.getMember('user');
  const reason = safeReason(interaction.options.getString('reason'));

  if (!member) {
    await interaction.reply({ content: '❌ That user is not in this server.', ephemeral: true });
    return;
  }
  if (member.user.bot) {
    await interaction.reply({ content: '❌ You cannot warn a bot.', ephemeral: true });
    return;
  }
  if (!member.moderatable) {
    await interaction.reply({ content: '❌ I cannot moderate that member (role hierarchy).', ephemeral: true });
    return;
  }

  const warn = addWarning(interaction.guild.id, member.id, { reason, moderator: interaction.user.tag });

  const embed = new EmbedBuilder()
    .setColor(Colors.Yellow)
    .setDescription(`⚠️ You have been warned in **${interaction.guild.name}**.\n**Reason:** ${reason}`);
  await member.send({ embeds: [embed] }).catch(() => {});

  await interaction.reply({ content: `⚠️ Warned ${member} (warn #${warn.id}) — ${reason}` });

  await logToModlog(interaction.guild, {
    title: '⚠️ Warn',
    description: `**User:** ${member.user.tag} (\`${member.id}\`)\n**Moderator:** ${interaction.user.tag}\n**Reason:** ${reason}\n**Total warnings:** ${warn.id}`,
    color: Colors.Yellow,
  });
}
