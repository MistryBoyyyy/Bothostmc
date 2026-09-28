import {
  SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, Colors,
} from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('slowmode')
  .setDescription('Set slowmode for this channel')
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
  .addIntegerOption((o) =>
    o.setName('seconds').setDescription('Seconds between messages (0 = off)').setRequired(true).setMinValue(0).setMaxValue(21600)
  );

export async function execute(interaction) {
  const seconds = interaction.options.getInteger('seconds');
  await interaction.channel.setRateLimitPerUser(seconds, `Slowmode by ${interaction.user.tag}`);

  const embed = new EmbedBuilder()
    .setColor(Colors.Yellow)
    .setDescription(seconds ? `🐢 Slowmode set to **${seconds}s** by ${interaction.user}.` : `🐇 Slowmode removed by ${interaction.user}.`);
  await interaction.reply({ embeds: [embed] });
}
