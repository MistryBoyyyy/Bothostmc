import {
  SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, Colors,
} from 'discord.js';
import { addTimer, getTimers, findTimer, updateTimer, removeTimer } from '../store.js';
import { parseDuration } from '../giveaways.js';
import { fmtDuration } from '../timers.js';
import E from '../premium.js';

export const data = new SlashCommandBuilder()
  .setName('timer')
  .setDescription('Server timers for events & competitions')
  .addSubcommand((s) =>
    s.setName('start')
      .setDescription('Start a named timer')
      .addStringOption((o) => o.setName('name').setDescription('Timer name').setRequired(true))
      .addStringOption((o) => o.setName('duration').setDescription('e.g. 30m, 2h, 1d').setRequired(true))
      .addStringOption((o) => o.setName('message').setDescription('What is this timer for?'))
  )
  .addSubcommand((s) =>
    s.setName('pause').setDescription('Pause a timer')
      .addStringOption((o) => o.setName('name').setDescription('Timer name').setRequired(true))
  )
  .addSubcommand((s) =>
    s.setName('resume').setDescription('Resume a paused timer')
      .addStringOption((o) => o.setName('name').setDescription('Timer name').setRequired(true))
  )
  .addSubcommand((s) =>
    s.setName('end').setDescription('End & delete a timer')
      .addStringOption((o) => o.setName('name').setDescription('Timer name').setRequired(true))
  )
  .addSubcommand((s) => s.setName('list').setDescription('List all running timers'));

export async function execute(interaction) {
  const sub = interaction.options.getSubcommand();
  const { guild } = interaction;

  if (sub === 'start') {
    if (!interaction.memberPermissions.has(PermissionFlagsBits.ManageEvents) &&
        !interaction.memberPermissions.has(PermissionFlagsBits.ManageGuild)) {
      await interaction.reply({ content: '❌ You need Manage Events or Manage Server.', ephemeral: true });
      return;
    }
    const name = interaction.options.getString('name');
    const dur = parseDuration(interaction.options.getString('duration'));
    if (!dur || dur < 5000) {
      await interaction.reply({ content: '❌ Invalid duration (e.g. `30m`, `2h`, `1d`).', ephemeral: true });
      return;
    }
    if (findTimer(guild.id, name)) {
      await interaction.reply({ content: `❌ A timer named \`${name}\` already exists.`, ephemeral: true });
      return;
    }
    addTimer({
      id: `${guild.id}-${Date.now()}`,
      guildId: guild.id,
      channelId: interaction.channel.id,
      name,
      totalMs: dur,
      remainingMs: dur,
      paused: false,
      createdBy: interaction.user.id,
      note: interaction.options.getString('message') ?? '',
    });
    await interaction.reply({ content: `${E.pfire} ⏱️ Timer **${name}** started for **${fmtDuration(dur)}** in this channel!` });
    return;
  }

  if (sub === 'list') {
    const timers = getTimers().filter((t) => t.guildId === guild.id);
    const embed = new EmbedBuilder().setColor(Colors.Blurple).setTitle('⏱️ Server Timers');
    if (!timers.length) embed.setDescription('No running timers.');
    else embed.setDescription(timers.map((t) =>
      `**${t.name}** — ${t.paused ? '⏸️ paused' : `⏳ ${fmtDuration(t.remainingMs)} left`}${t.note ? ` • ${t.note}` : ''}`
    ).join('\n'));
    await interaction.reply({ embeds: [embed] });
    return;
  }

  // pause / resume / end need the timer
  const name = interaction.options.getString('name');
  const t = findTimer(guild.id, name);
  if (!t) {
    await interaction.reply({ content: `❌ No timer named \`${name}\`.`, ephemeral: true });
    return;
  }

  if (sub === 'pause') {
    updateTimer(t.id, { paused: true });
    await interaction.reply({ content: `⏸️ Timer **${name}** paused at ${fmtDuration(t.remainingMs)}.` });
  } else if (sub === 'resume') {
    updateTimer(t.id, { paused: false });
    await interaction.reply({ content: `▶️ Timer **${name}** resumed — ${fmtDuration(t.remainingMs)} left.` });
  } else if (sub === 'end') {
    removeTimer(t.id);
    await interaction.reply({ content: `⏹️ Timer **${name}** ended by ${interaction.user}.` });
  }
}
