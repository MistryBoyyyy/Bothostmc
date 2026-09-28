import {
  SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, Colors,
} from 'discord.js';
import { logToModlog, safeReason } from '../util.js';

export const data = new SlashCommandBuilder()
  .setName('ban')
  .setDescription('Ban a member from the server')
  .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
  .addUserOption((o) => o.setName('user').setDescription('User to ban').setRequired(true))
  .addStringOption((o) => o.setName('reason').setDescription('Reason'))
  .addIntegerOption((o) =>
    o.setName('delete-days')
      .setDescription('Days of their messages to delete (0-7)')
      .setMinValue(0)
      .setMaxValue(7)
  );

export async function execute(interaction) {
  const user = interaction.options.getUser('user');
  const reason = safeReason(interaction.options.getString('reason'));
  const deleteDays = interaction.options.getInteger('delete-days') ?? 0;

  const member = await interaction.guild.members.fetch(user.id).catch(() => null);
  if (member && !member.bannable) {
    await interaction.reply({ content: '❌ I cannot ban that member (role hierarchy or permissions).', ephemeral: true });
    return;
  }

  if (member) {
    const dm = new EmbedBuilder()
      .setColor(Colors.DarkRed)
      .setDescription(`🔨 You have been banned from **${interaction.guild.name}**.\n**Reason:** ${reason}`);
    await member.send({ embeds: [dm] }).catch(() => {});
  }

  await interaction.guild.bans.create(user.id, { reason, deleteMessageSeconds: deleteDays * 86400 });
  await interaction.reply({ content: `🔨 Banned ${user.tag} — ${reason}` });

  await logToModlog(interaction.guild, {
    title: '🔨 Ban',
    description: `**User:** ${user.tag} (\`${user.id}\`)\n**Moderator:** ${interaction.user.tag}\n**Reason:** ${reason}\n**Deleted messages:** last ${deleteDays} day(s)`,
    color: Colors.DarkRed,
  });
}
