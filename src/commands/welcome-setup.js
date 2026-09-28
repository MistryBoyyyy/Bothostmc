import {
  SlashCommandBuilder, ChannelType, PermissionFlagsBits, EmbedBuilder, Colors,
} from 'discord.js';
import { setGuildConfig } from '../store.js';

export const data = new SlashCommandBuilder()
  .setName('welcome-setup')
  .setDescription('Set the welcome channel and message')
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
  .addChannelOption((o) =>
    o.setName('channel').setDescription('Channel for welcome/goodbye messages').setRequired(true).addChannelTypes(ChannelType.GuildText)
  )
  .addStringOption((o) =>
    o.setName('message').setDescription('Custom message. Placeholders: {user} {name} {server} {count} {inviterline}')
  );

export async function execute(interaction) {
  const channel = interaction.options.getChannel('channel');
  const message = interaction.options.getString('message');

  const patch = { welcomeChannel: channel.id };
  if (message) patch.welcomeMessage = message;
  setGuildConfig(interaction.guild.id, patch);

  const embed = new EmbedBuilder()
    .setColor(Colors.Green)
    .setDescription(`✅ Welcome channel set to ${channel}${message ? ' with your custom message.' : '.'}\nNew members will be greeted there automatically.`);
  await interaction.reply({ embeds: [embed], ephemeral: true });
}
