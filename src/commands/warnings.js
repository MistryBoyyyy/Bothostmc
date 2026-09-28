import {
  SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, Colors,
} from 'discord.js';
import { getWarnings } from '../store.js';

export const data = new SlashCommandBuilder()
  .setName('warnings')
  .setDescription("View a member's warnings")
  .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
  .addUserOption((o) => o.setName('user').setDescription('Member').setRequired(true));

export async function execute(interaction) {
  const member = interaction.options.getMember('user');
  if (!member) {
    await interaction.reply({ content: '❌ That user is not in this server.', ephemeral: true });
    return;
  }

  const warns = getWarnings(interaction.guild.id, member.id);
  const embed = new EmbedBuilder()
    .setColor(Colors.Blurple)
    .setTitle(`Warnings for ${member.user.tag}`);

  if (!warns.length) {
    embed.setDescription('✅ No warnings.');
  } else {
    embed.setDescription(
      warns
        .map((w) => `**#${w.id}** — ${w.reason}\n> by ${w.moderator} • <t:${Math.floor(w.timestamp / 1000)}:R>`)
        .join('\n')
    );
  }

  await interaction.reply({ embeds: [embed], ephemeral: true });
}
