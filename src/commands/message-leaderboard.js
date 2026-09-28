import { SlashCommandBuilder, EmbedBuilder, Colors } from 'discord.js';
import { getMessageLeaderboard } from '../store.js';

const MEDALS = ['🥇', '', '🥉'];

export const data = new SlashCommandBuilder()
  .setName('message-leaderboard')
  .setDescription('Most active members (all-time + today)');

export async function execute(interaction) {
  const all = getMessageLeaderboard(interaction.guild.id, { limit: 10 });
  const daily = getMessageLeaderboard(interaction.guild.id, { daily: true, limit: 5 });

  const embed = new EmbedBuilder()
    .setColor(Colors.Gold)
    .setTitle('💬 Message Leaderboard');

  embed.addFields({
    name: '🏆 All-Time Top 10',
    value: all.length ? all.map((e, i) => `${MEDALS[i] ?? `**${i + 1}.**`} <@${e.id}> — **${e.total}** msgs`).join('\n') : '*No messages tracked yet*',
  });
  embed.addFields({
    name: '⚡ Today',
    value: daily.length ? daily.map((e, i) => `${MEDALS[i] ?? `**${i + 1}.**`} <@${e.id}> — **${e.today}** msgs`).join('\n') : '*Nobody has chatted today*',
  });

  await interaction.reply({ embeds: [embed] });
}
