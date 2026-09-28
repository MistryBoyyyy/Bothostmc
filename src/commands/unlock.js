import {
  SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, Colors,
} from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('unlock')
  .setDescription('Unlock this channel for members')
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels);

export async function execute(interaction) {
  const ow = interaction.channel.permissionOverwrites.cache.get(interaction.guild.id);
  await interaction.channel.permissionOverwrites.edit(interaction.guild.id, {
    SendMessages: null,
    AddReactions: null,
    CreatePublicThreads: null,
  });

  const embed = new EmbedBuilder()
    .setColor(Colors.Green)
    .setDescription(`🔓 **${interaction.channel.name}** has been unlocked by ${interaction.user}.`);
  await interaction.channel.send({ embeds: [embed] });
  await interaction.reply({ content: '🔓 Channel unlocked.', ephemeral: true });
}
