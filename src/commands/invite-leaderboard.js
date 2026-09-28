import { SlashCommandBuilder, EmbedBuilder, Colors } from 'discord.js';
import { getInviteLeaderboard } from '../store.js';

const MEDALS = ['🥇', '🥈', '🥉'];

export const data = new SlashCommandBuilder()
  .setName('invite-leaderboard')
  .setDescription('Top 10 inviters of this server');

export async function execute(interaction) {
  const board = getInviteLeaderboard(interaction.guild.id);

  const embed = new EmbedBuilder()
    .setColor(Colors.Gold)
    .setTitle('🏆 Invite Leaderboard');

  if (!board.length) {
    embed.setDescription('No invites tracked yet. Invite friends to climb the board!');
  } else {
    embed.setDescription(
      board
        .map((e, i) => `${MEDALS[i] ?? `**${i + 1}.**`} <@${e.id}> — **${e.net}** invites (${e.total} total, ${e.left} left)`)
        .join('\n')
    );
  }

  await interaction.reply({ embeds: [embed] });
}
