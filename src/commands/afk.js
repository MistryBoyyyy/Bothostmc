import { SlashCommandBuilder } from 'discord.js';
import { setAfk } from '../store.js';

export const data = new SlashCommandBuilder()
  .setName('afk')
  .setDescription('Set yourself AFK — people who ping you will be notified')
  .addStringOption((o) => o.setName('reason').setDescription('Why are you AFK?'));

export async function execute(interaction) {
  const reason = interaction.options.getString('reason') ?? 'No reason given';
  setAfk(interaction.guild.id, interaction.user.id, reason);
  await interaction.reply({ content: `💤 You are now AFK — *${reason}*`, ephemeral: true });
}
