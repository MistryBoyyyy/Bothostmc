import { SlashCommandBuilder, EmbedBuilder, Colors } from 'discord.js';
import { getInviterData } from '../store.js';

export const data = new SlashCommandBuilder()
  .setName('invites')
  .setDescription("Check someone's invite count")
  .addUserOption((o) => o.setName('user').setDescription('User (default: you)'));

export async function execute(interaction) {
  const user = interaction.options.getUser('user') ?? interaction.user;
  const data = getInviterData(interaction.guild.id, user.id);

  const embed = new EmbedBuilder()
    .setColor(Colors.Blurple)
    .setTitle(`📨 Invites — ${user.tag}`)
    .addFields(
      { name: 'Total invites', value: `${data?.total ?? 0}`, inline: true },
      { name: 'Left', value: `${data?.left ?? 0}`, inline: true },
      { name: 'Net (current members)', value: `${(data?.total ?? 0) - (data?.left ?? 0)}`, inline: true }
    );

  await interaction.reply({ embeds: [embed] });
}
