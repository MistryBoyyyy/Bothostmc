import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('nick')
  .setDescription("Change a member's nickname")
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageNicknames)
  .addUserOption((o) => o.setName('user').setDescription('Member').setRequired(true))
  .addStringOption((o) => o.setName('name').setDescription('New nickname (leave empty to reset)').setMaxLength(32));

export async function execute(interaction) {
  const member = interaction.options.getMember('user');
  const name = interaction.options.getString('name');

  if (!member) {
    await interaction.reply({ content: '❌ That user is not in this server.', ephemeral: true });
    return;
  }
  if (!member.manageable) {
    await interaction.reply({ content: '❌ I cannot change that nickname (role hierarchy).', ephemeral: true });
    return;
  }

  await member.setNickname(name ?? null, `By ${interaction.user.tag}`);
  await interaction.reply({ content: name ? `✅ Nickname of ${member} changed to **${name}**.` : `✅ Nickname of ${member} reset.` });
}
