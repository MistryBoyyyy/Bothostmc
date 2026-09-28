import {
  SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, Colors,
} from 'discord.js';
import { setGuildConfig } from '../store.js';

export const data = new SlashCommandBuilder()
  .setName('autorole')
  .setDescription('Set the role given automatically when someone joins')
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
  .addRoleOption((o) => o.setName('role').setDescription('Role to give (leave empty to disable)'));

export async function execute(interaction) {
  const role = interaction.options.getRole('role');
  const cfg = setGuildConfig(interaction.guild.id, { autorole: role ? role.id : null });

  const embed = new EmbedBuilder()
    .setColor(Colors.Green)
    .setDescription(cfg.autorole ? `✅ New members will receive ${role} automatically.` : '✅ Autorole disabled.');
  await interaction.reply({ embeds: [embed], ephemeral: true });
}
