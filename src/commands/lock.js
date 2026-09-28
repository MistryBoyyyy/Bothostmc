import {
  SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, Colors,
} from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('lock')
  .setDescription('Lock this channel so members cannot send messages')
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels);

export async function execute(interaction) {
  await interaction.channel.permissionOverwrites.edit(interaction.guild.id, {
    SendMessages: false,
    AddReactions: false,
    CreatePublicThreads: false,
  });

  const embed = new EmbedBuilder()
    .setColor(Colors.Red)
    .setDescription(`🔒 **${interaction.channel.name}** has been locked by ${interaction.user}.\nOnly staff with proper permissions can send messages.`);
  await interaction.channel.send({ embeds: [embed] });
  await interaction.reply({ content: '🔒 Channel locked.', ephemeral: true });
}
