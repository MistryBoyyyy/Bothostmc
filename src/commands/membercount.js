import { SlashCommandBuilder, EmbedBuilder, Colors } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('membercount')
  .setDescription('Show the member count breakdown');

export async function execute(interaction) {
  const guild = interaction.guild;
  const bots = guild.members.cache.filter((m) => m.user.bot).size;
  const humans = guild.members.cache.filter((m) => !m.user.bot).size;
  const online = guild.members.cache.filter((m) => m.presence && m.presence.status !== 'offline').size;

  const embed = new EmbedBuilder()
    .setColor(Colors.Blurple)
    .setTitle(`👥 Members — ${guild.name}`)
    .addFields(
      { name: 'Total', value: `${guild.memberCount}`, inline: true },
      { name: 'Humans', value: `${humans}`, inline: true },
      { name: 'Bots', value: `${bots}`, inline: true }
    )
    .setTimestamp();

  await interaction.reply({ embeds: [embed] });
}
