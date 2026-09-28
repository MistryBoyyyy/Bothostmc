import {
  SlashCommandBuilder, ChannelType, PermissionFlagsBits,
} from 'discord.js';
import { startGiveaway, endGiveaway } from '../giveaways.js';

export const data = new SlashCommandBuilder()
  .setName('giveaway')
  .setDescription('Manage giveaways')
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
  .addSubcommand((s) =>
    s.setName('start')
      .setDescription('Start a new giveaway')
      .addChannelOption((o) =>
        o.setName('channel').setDescription('Where to post').setRequired(true).addChannelTypes(ChannelType.GuildText)
      )
      .addStringOption((o) =>
        o.setName('duration').setDescription('Duration, e.g. 30s, 10m, 2h, 1d').setRequired(true)
      )
      .addIntegerOption((o) =>
        o.setName('winners').setDescription('Number of winners').setRequired(true).setMinValue(1).setMaxValue(50)
      )
      .addStringOption((o) => o.setName('prize').setDescription('What are you giving away?').setRequired(true))
      .addStringOption((o) => o.setName('reaction').setDescription('Emoji used to enter (default 🎉, e.g. 💎 for premium)'))
  )
  .addSubcommand((s) =>
    s.setName('end')
      .setDescription('End a running giveaway now')
      .addStringOption((o) => o.setName('message-id').setDescription('ID of the giveaway message').setRequired(true))
  )
  .addSubcommand((s) =>
    s.setName('reroll')
      .setDescription('Pick new winners for an ended giveaway')
      .addStringOption((o) => o.setName('message-id').setDescription('ID of the giveaway message').setRequired(true))
  );

export async function execute(interaction, client) {
  const sub = interaction.options.getSubcommand();

  if (sub === 'start') {
    await startGiveaway(interaction, {
      channel: interaction.options.getChannel('channel'),
      durationStr: interaction.options.getString('duration'),
      winners: interaction.options.getInteger('winners'),
      prize: interaction.options.getString('prize'),
      reaction: interaction.options.getString('reaction'),
    });
    return;
  }

  const messageId = interaction.options.getString('message-id');
  await interaction.deferReply({ ephemeral: true });
  const result = await endGiveaway(client, messageId, { reroll: sub === 'reroll' });
  await interaction.editReply(
    result.ok
      ? `✅ ${sub === 'reroll' ? 'Rerolled' : 'Ended'}! Winners: ${result.winners.map((u) => u.toString()).join(', ') || 'none'}`
      : `❌ ${result.msg}`
  );
}
