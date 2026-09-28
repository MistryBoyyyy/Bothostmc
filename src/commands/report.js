import {
  SlashCommandBuilder, EmbedBuilder, Colors,
} from 'discord.js';
import { getGuildConfig } from '../store.js';

export const data = new SlashCommandBuilder()
  .setName('report')
  .setDescription('Report a user to the staff team')
  .addUserOption((o) => o.setName('user').setDescription('User to report').setRequired(true))
  .addStringOption((o) => o.setName('reason').setDescription('What did they do?').setRequired(true));

export async function execute(interaction) {
  const user = interaction.options.getUser('user');
  const reason = interaction.options.getString('reason');

  if (user.id === interaction.user.id) {
    await interaction.reply({ content: '❌ You cannot report yourself.', ephemeral: true });
    return;
  }

  const cfg = getGuildConfig(interaction.guild.id);
  if (!cfg.modlog) {
    await interaction.reply({ content: '❌ Report system is not configured (no mod-log channel set).', ephemeral: true });
    return;
  }
  const channel = interaction.guild.channels.cache.get(cfg.modlog);
  if (!channel?.isTextBased()) {
    await interaction.reply({ content: '❌ Report channel not found.', ephemeral: true });
    return;
  }

  const embed = new EmbedBuilder()
    .setColor(Colors.Red)
    .setTitle('🚨 User Report')
    .addFields(
      { name: 'Reported user', value: `${user} (\`${user.id}\`)`, inline: true },
      { name: 'Reporter', value: `${interaction.user} (\`${interaction.user.id}\`)`, inline: true },
      { name: 'Channel', value: `${interaction.channel}`, inline: true },
      { name: 'Reason', value: reason }
    )
    .setTimestamp();

  await channel.send({ embeds: [embed] });
  await interaction.reply({ content: '✅ Report sent to staff. Thank you!', ephemeral: true });
}
