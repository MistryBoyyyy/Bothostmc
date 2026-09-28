import {
  SlashCommandBuilder, ChannelType, PermissionFlagsBits, EmbedBuilder, Colors,
} from 'discord.js';
import { setGuildConfig } from '../store.js';

export const data = new SlashCommandBuilder()
  .setName('setmodlog')
  .setDescription('Set the channel where MC-Security logs moderation actions')
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
  .addChannelOption((o) =>
    o.setName('channel').setDescription('Log channel (or leave empty to disable)').addChannelTypes(ChannelType.GuildText)
  );

export async function execute(interaction) {
  const channel = interaction.options.getChannel('channel');
  const cfg = setGuildConfig(interaction.guild.id, { modlog: channel ? channel.id : null });

  const embed = new EmbedBuilder().setColor(Colors.Green).setDescription(
    cfg.modlog
      ? `✅ Mod-log channel set to <#${cfg.modlog}>`
      : '✅ Mod-logging disabled.'
  );
  await interaction.reply({ embeds: [embed], ephemeral: true });
}
