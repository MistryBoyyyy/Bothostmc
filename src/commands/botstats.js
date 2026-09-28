import { SlashCommandBuilder, EmbedBuilder, Colors } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('botstats')
  .setDescription('MC-Security bot statistics');

export async function execute(interaction, client) {
  const uptime = Math.floor(process.uptime());
  const h = Math.floor(uptime / 3600);
  const m = Math.floor((uptime % 3600) / 60);
  const s = uptime % 60;
  const mem = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(1);

  const embed = new EmbedBuilder()
    .setColor(Colors.Blurple)
    .setTitle('🛡️ MC-Security Stats')
    .setThumbnail(client.user.displayAvatarURL())
    .addFields(
      { name: 'Uptime', value: `${h}h ${m}m ${s}s`, inline: true },
      { name: 'Servers', value: `${client.guilds.cache.size}`, inline: true },
      { name: 'Ping', value: `${Math.round(client.ws.ping)}ms`, inline: true },
      { name: 'Memory', value: `${mem} MB`, inline: true },
      { name: 'Commands', value: `${client.commands.size}`, inline: true },
      { name: 'Library', value: 'discord.js v14', inline: true }
    );

  await interaction.reply({ embeds: [embed] });
}
