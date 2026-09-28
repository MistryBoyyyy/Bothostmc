import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('removerole')
  .setDescription('Remove a role from a member')
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
  .addUserOption((o) => o.setName('user').setDescription('Member').setRequired(true))
  .addRoleOption((o) => o.setName('role').setDescription('Role to remove').setRequired(true));

export async function execute(interaction) {
  const member = interaction.options.getMember('user');
  const role = interaction.options.getRole('role');

  if (!member) {
    await interaction.reply({ content: '❌ That user is not in this server.', ephemeral: true });
    return;
  }
  if (role.position >= interaction.guild.members.me.roles.highest.position) {
    await interaction.reply({ content: '❌ That role is above my highest role.', ephemeral: true });
    return;
  }

  await member.roles.remove(role, `By ${interaction.user.tag}`);
  await interaction.reply({ content: `✅ Removed ${role} from ${member}.` });
}
