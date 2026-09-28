import {
  SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, Colors,
} from 'discord.js';
import { logToModlog, safeReason } from '../util.js';

export const data = new SlashCommandBuilder()
  .setName('kick')
  .setDescription('Kick a member from the server')
  .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
  .addUserOption((o) => o.setName('user').setDescription('Member to kick').setRequired(true))
  .addStringOption((o) => o.setName('reason').setDescription('Reason'));

export async function execute(interaction) {
  const member = interaction.options.getMember('user');
  const reason = safeReason(interaction.options.getString('reason'));

  if (!member) {
    await interaction.reply({ content: '❌ That user is not in this server.', ephemeral: true });
    return;
  }
  if (!member.kickable) {
    await interaction.reply({ content: '❌ I cannot kick that member (role hierarchy or permissions).', ephemeral: true });
    return;
  }

  const dm = new EmbedBuilder()
    .setColor(Colors.Red)
    .setDescription(`❌ You have been kicked from **${interaction.guild.name}**.\n**Reason:** ${reason}`);
  await member.send({ embeds: [dm] }).catch(() => {});

  await member.kick(reason);
  await interaction.reply({ content: `👢 Kicked ${member.user.tag} — ${reason}` });

  await logToModlog(interaction.guild, {
    title: '👢 Kick',
    description: `**User:** ${member.user.tag} (\`${member.id}\`)\n**Moderator:** ${interaction.user.tag}\n**Reason:** ${reason}`,
    color: Colors.Red,
  });
}
