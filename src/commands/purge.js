import {
  SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, Colors,
} from 'discord.js';
import { logToModlog } from '../util.js';

export const data = new SlashCommandBuilder()
  .setName('purge')
  .setDescription('Bulk delete messages from this channel')
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
  .addIntegerOption((o) =>
    o.setName('count').setDescription('How many messages to delete (1-100)').setRequired(true).setMinValue(1).setMaxValue(100)
  )
  .addUserOption((o) => o.setName('user').setDescription('Only delete messages from this user'));

export async function execute(interaction) {
  const count = interaction.options.getInteger('count');
  const user = interaction.options.getUser('user');

  await interaction.deferReply({ ephemeral: true });

  let deleted;
  if (user) {
    const fetched = await interaction.channel.messages.fetch({ limit: 100 });
    const targets = [...fetched.values()].filter(
      (m) => m.author.id === user.id && Date.now() - m.createdTimestamp < 14 * 86400_000
    ).slice(0, count);
    deleted = (await interaction.channel.bulkDelete(targets, true)).size;
  } else {
    deleted = (await interaction.channel.bulkDelete(count, true)).size;
  }

  const embed = new EmbedBuilder()
    .setColor(Colors.Green)
    .setDescription(`🧹 Deleted **${deleted}** message(s)${user ? ` from ${user}` : ''}.`);
  await interaction.editReply({ embeds: [embed] });

  await logToModlog(interaction.guild, {
    title: '🧹 Purge',
    description: `**Channel:** ${interaction.channel}\n**Deleted:** ${deleted}${user ? ` (from ${user.tag})` : ''}\n**Moderator:** ${interaction.user.tag}`,
  });
}
