import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { logToModlog } from '../util.js';

export const data = new SlashCommandBuilder()
  .setName('untimeout')
  .setDescription('Remove a timeout from a member')
  .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
  .addUserOption((o) => o.setName('user').setDescription('Member').setRequired(true));

export async function execute(interaction) {
  const member = interaction.options.getMember('user');
  if (!member) {
    await interaction.reply({ content: '❌ That user is not in this server.', ephemeral: true });
    return;
  }
  if (!member.moderatable) {
    await interaction.reply({ content: '❌ I cannot moderate that member (role hierarchy).', ephemeral: true });
    return;
  }

  await member.timeout(null, `Untimeout by ${interaction.user.tag}`);
  await interaction.reply({ content: `✅ Removed timeout from ${member}.` });
  await logToModlog(interaction.guild, {
    title: '🔊 Timeout Removed',
    description: `**User:** ${member.user.tag} (\`${member.id}\`)\n**Moderator:** ${interaction.user.tag}`,
  });
}
