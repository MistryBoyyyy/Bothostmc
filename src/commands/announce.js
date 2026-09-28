import {
  SlashCommandBuilder, ChannelType, PermissionFlagsBits, EmbedBuilder, Colors,
} from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('announce')
  .setDescription('Send a fancy announcement embed')
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
  .addStringOption((o) => o.setName('title').setDescription('Announcement title').setRequired(true))
  .addStringOption((o) => o.setName('message').setDescription('Announcement text').setRequired(true))
  .addChannelOption((o) =>
    o.setName('channel').setDescription('Where to post (default: here)').addChannelTypes(ChannelType.GuildText)
  );

export async function execute(interaction) {
  const channel = interaction.options.getChannel('channel') ?? interaction.channel;
  const title = interaction.options.getString('title');
  const text = interaction.options.getString('message');

  const embed = new EmbedBuilder()
    .setColor(Colors.DarkRed)
    .setAuthor({ name: `📢 Announcement by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
    .setTitle(title)
    .setDescription(text)
    .setFooter({ text: interaction.guild.name, iconURL: interaction.guild.iconURL() ?? undefined })
    .setTimestamp();

  await channel.send({ embeds: [embed] });
  await interaction.reply({ content: `✅ Announcement posted in ${channel}.`, ephemeral: true });
}
