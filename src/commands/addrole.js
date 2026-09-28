import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('addrole')
  .setDescription('Give a role to a member')
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
  .addUserOption((o) => o.setName('user').setDescription('Member').setRequired(true))
  .addRoleOption((o) => o.setName('role').setDescription('Role to give').setRequired(true));

export async function execute(interaction) {
  const member = interaction.options.getMember('user');
  const role = interaction.options.getRole('role');

  if (!member) {
    await interaction.reply({ content: '❌ That user is not in this server.', ephemeral: true });
    return;
  }
  if (role.managed) {
    await interaction.reply({ content: '❌ I cannot give bot/integration roles.', ephemeral: true });
    return;
  }
  if (role.position >= interaction.guild.members.me.roles.highest.position) {
    await interaction.reply({ content: '❌ That role is above my highest role — move my role higher.', ephemeral: true });
    return;
  }

  await member.roles.add(role, `By ${interaction.user.tag}`);
  await interaction.reply({ content: `✅ Gave ${role} to ${member}.` });
}
