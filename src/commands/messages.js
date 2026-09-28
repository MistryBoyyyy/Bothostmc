import { SlashCommandBuilder, EmbedBuilder, Colors } from 'discord.js';
import { getMessageStats } from '../store.js';

export const data = new SlashCommandBuilder()
  .setName('messages')
  .setDescription("Check someone's message count")
  .addUserOption((o) => o.setName('user').setDescription('User (default: you)'));

export async function execute(interaction) {
  const user = interaction.options.getUser('user') ?? interaction.user;
  const s = getMessageStats(interaction.guild.id, user.id);

  const embed = new EmbedBuilder()
    .setColor(Colors.Blurple)
    .setTitle(`💬 Messages — ${user.tag}`)
    .addFields(
      { name: 'All-time', value: `${s.total}`, inline: true },
      { name: 'Today', value: `${s.today}`, inline: true }
    );
  await interaction.reply({ embeds: [embed] });
}
