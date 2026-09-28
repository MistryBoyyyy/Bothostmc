import { SlashCommandBuilder } from 'discord.js';
import { buildIpEmbed } from '../ipembed.js';

export const data = new SlashCommandBuilder()
  .setName('ip')
  .setDescription('Show the Minecraft server IP');

export async function execute(interaction) {
  await interaction.reply({ embeds: [buildIpEmbed(interaction.guild)] });
}
