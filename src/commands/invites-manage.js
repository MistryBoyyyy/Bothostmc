import {
  SlashCommandBuilder, PermissionFlagsBits,
} from 'discord.js';
import { adjustInvites, resetInvites } from '../store.js';

export const data = new SlashCommandBuilder()
  .setName('invites-manage')
  .setDescription('Manually adjust invite counts (admin)')
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
  .addSubcommand((s) =>
    s.setName('add').setDescription('Add invites to a user')
      .addUserOption((o) => o.setName('user').setDescription('User').setRequired(true))
      .addIntegerOption((o) => o.setName('amount').setDescription('How many').setRequired(true).setMinValue(1).setMaxValue(1000))
  )
  .addSubcommand((s) =>
    s.setName('remove').setDescription('Remove invites from a user')
      .addUserOption((o) => o.setName('user').setDescription('User').setRequired(true))
      .addIntegerOption((o) => o.setName('amount').setDescription('How many').setRequired(true).setMinValue(1).setMaxValue(1000))
  )
  .addSubcommand((s) =>
    s.setName('reset').setDescription('Reset invites to 0')
      .addUserOption((o) => o.setName('user').setDescription('User').setRequired(true))
  );

export async function execute(interaction) {
  const sub = interaction.options.getSubcommand();
  const user = interaction.options.getUser('user');

  if (sub === 'reset') {
    resetInvites(interaction.guild.id, user.id);
    await interaction.reply({ content: `✅ Invite count for ${user} reset to 0.` });
    return;
  }
  const amount = interaction.options.getInteger('amount');
  const entry = adjustInvites(interaction.guild.id, user.id, sub === 'add' ? amount : -amount);
  await interaction.reply({ content: `✅ ${sub === 'add' ? 'Added' : 'Removed'} ${amount} invites ${sub === 'add' ? 'to' : 'from'} ${user} — now **${entry.total}**.` });
}
