import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { logToModlog, safeReason } from '../util.js';

export const data = new SlashCommandBuilder()
  .setName('unban')
  .setDescription('Unban a user by their ID')
  .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
  .addStringOption((o) => o.setName('user-id').setDescription('The user ID to unban').setRequired(true))
  .addStringOption((o) => o.setName('reason').setDescription('Reason'));

export async function execute(interaction) {
  const userId = interaction.options.getString('user-id');
  const reason = safeReason(interaction.options.getString('reason'));

  if (!/^\d{17,20}$/.test(userId)) {
    await interaction.reply({ content: '❌ That does not look like a valid user ID.', ephemeral: true });
    return;
  }

  try {
    await interaction.guild.bans.remove(userId, reason);
  } catch {
    await interaction.reply({ content: '❌ Could not unban — is that user actually banned?', ephemeral: true });
    return;
  }

  await interaction.reply({ content: `✅ Unbanned \`${userId}\` — ${reason}` });
  await logToModlog(interaction.guild, {
    title: '✅ Unban',
    description: `**User ID:** \`${userId}\`\n**Moderator:** ${interaction.user.tag}\n**Reason:** ${reason}`,
  });
}
