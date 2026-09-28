import {
  SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, Colors,
} from 'discord.js';
import { setGuildConfig } from '../store.js';
import { ticketPanelEmbed, ticketPanelRow } from '../tickets.js';

export const data = new SlashCommandBuilder()
  .setName('ticket-setup')
  .setDescription('Post the ticket panel in this channel and set the ticket category')
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
  .addChannelOption((o) =>
    o.setName('category').setDescription('Category where ticket channels will be created').addChannelTypes(4)
  );

export async function execute(interaction) {
  const category = interaction.options.getChannel('category');
  if (category) setGuildConfig(interaction.guild.id, { ticketCategory: category.id });

  await interaction.channel.send({ embeds: [ticketPanelEmbed()], components: [ticketPanelRow()] });
  await interaction.reply({
    embeds: [new EmbedBuilder().setColor(Colors.Green).setDescription(
      `✅ Ticket panel posted in ${interaction.channel}${category ? ` — new tickets will be created under ${category}.` : '.'}`
    )],
    ephemeral: true,
  });
}
