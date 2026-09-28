import {
  SlashCommandBuilder, EmbedBuilder, Colors, ChannelType,
} from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('serverinfo')
  .setDescription('Show information about this server');

export async function execute(interaction) {
  const { guild } = interaction;

  const counts = guild.channels.cache.reduce(
    (acc, c) => {
      if (c.type === ChannelType.GuildText) acc.text++;
      else if (c.type === ChannelType.GuildVoice) acc.voice++;
      else if (c.type === ChannelType.GuildCategory) acc.category++;
      return acc;
    },
    { text: 0, voice: 0, category: 0 }
  );

  const embed = new EmbedBuilder()
    .setColor(Colors.Blurple)
    .setThumbnail(guild.iconURL())
    .setTitle(`Server Info — ${guild.name}`)
    .addFields(
      { name: 'Owner', value: `<@${guild.ownerId}>`, inline: true },
      { name: 'Members', value: `${guild.memberCount}`, inline: true },
      { name: 'Created', value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:R>`, inline: true },
      { name: 'Text channels', value: `${counts.text}`, inline: true },
      { name: 'Voice channels', value: `${counts.voice}`, inline: true },
      { name: 'Categories', value: `${counts.category}`, inline: true },
      { name: 'Boosts', value: `${guild.premiumSubscriptionCount ?? 0}`, inline: true },
      { name: 'Roles', value: `${guild.roles.cache.size}`, inline: true },
      { name: 'ID', value: `\`${guild.id}\``, inline: true }
    );

  await interaction.reply({ embeds: [embed] });
}
