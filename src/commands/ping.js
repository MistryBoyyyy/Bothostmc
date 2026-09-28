import { SlashCommandBuilder, EmbedBuilder, Colors } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('ping')
  .setDescription('Check MC-Security bot latency');

export async function execute(interaction, client) {
  const sent = await interaction.reply({ content: '🏓 Pinging...', fetchReply: true });
  const rtt = sent.createdTimestamp - interaction.createdTimestamp;
  const embed = new EmbedBuilder()
    .setColor(Colors.Green)
    .setTitle('🏓 Pong!')
    .addFields(
      { name: 'Roundtrip', value: `\`${rtt}ms\``, inline: true },
      { name: 'WebSocket', value: `\`${Math.round(client.ws.ping)}ms\``, inline: true }
    );
  await interaction.editReply({ content: null, embeds: [embed] });
}
