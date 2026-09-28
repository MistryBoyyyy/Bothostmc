import {
  SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, Colors,
} from 'discord.js';
import { removeWarning } from '../store.js';
import { logToModlog } from '../util.js';

export const data = new SlashCommandBuilder()
  .setName('delwarn')
  .setDescription('Delete a warning by its ID')
  .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
  .addUserOption((o) => o.setName('user').setDescription('Member').setRequired(true))
  .addStringOption((o) => o.setName('warn-id').setDescription('Warning ID (from /warnings)').setRequired(true));

export async function execute(interaction) {
  const member = interaction.options.getMember('user');
  const warnId = interaction.options.getString('warn-id');
  if (!member) {
    await interaction.reply({ content: '❌ That user is not in this server.', ephemeral: true });
    return;
  }

  const ok = removeWarning(interaction.guild.id, member.id, warnId);
  if (!ok) {
    await interaction.reply({ content: `❌ Warning #${warnId} not found for ${member.user.tag}.`, ephemeral: true });
    return;
  }

  await interaction.reply({ content: `✅ Deleted warning #${warnId} for ${member}.` });
  await logToModlog(interaction.guild, {
    title: '🧹 Warning Removed',
    description: `**User:** ${member.user.tag} (\`${member.id}\`)\n**Warning:** #${warnId}\n**Moderator:** ${interaction.user.tag}`,
    color: Colors.Green,
  });
}
