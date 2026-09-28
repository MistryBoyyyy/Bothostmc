import { SlashCommandBuilder, EmbedBuilder, Colors } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('avatar')
  .setDescription("Show someone's avatar")
  .addUserOption((o) => o.setName('user').setDescription('User (default: you)'));

export async function execute(interaction) {
  const user = interaction.options.getUser('user') ?? interaction.user;
  const url = user.displayAvatarURL({ size: 1024 });

  const embed = new EmbedBuilder()
    .setColor(Colors.Blurple)
    .setTitle(`${user.tag}'s Avatar`)
    .setImage(url)
    .setDescription(`[PNG](${user.displayAvatarURL({ extension: 'png', size: 1024 })}) • [JPG](${user.displayAvatarURL({ extension: 'jpg', size: 1024 })}) • [WEBP](${url})`);

  await interaction.reply({ embeds: [embed] });
}
