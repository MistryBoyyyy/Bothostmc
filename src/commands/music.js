import { SlashCommandBuilder, EmbedBuilder, Colors } from 'discord.js';
import { skip, pause, resume, stopAll, setVolume, queueList, musicSession, musicEmbed } from '../music.js';
import E from '../premium.js';

export const data = new SlashCommandBuilder()
  .setName('music')
  .setDescription('🎵 Music player controls')
  .addSubcommand((s) => s.setName('skip').setDescription('Skip the current track'))
  .addSubcommand((s) => s.setName('pause').setDescription('Pause playback'))
  .addSubcommand((s) => s.setName('resume').setDescription('Resume playback'))
  .addSubcommand((s) => s.setName('stop').setDescription('Stop music and clear the queue'))
  .addSubcommand((s) => s.setName('queue').setDescription('Show the upcoming tracks'))
  .addSubcommand((s) => s.setName('np').setDescription('Show the currently playing track'))
  .addSubcommand((s) =>
    s.setName('volume')
      .setDescription('Set playback volume')
      .addIntegerOption((o) => o.setName('level').setDescription('0 - 100').setRequired(true)));

export async function execute(interaction) {
  const sub = interaction.options.getSubcommand();
  const gid = interaction.guild.id;

  if (sub === 'play-note') return; // reserved

  if (sub === 'skip') {
    const ok = skip(gid);
    return interaction.reply({ embeds: [musicEmbed({ title: ok ? 'Skipped ⏭️' : 'Nothing is playing', color: ok ? Colors.Green : Colors.Greyple })], ephemeral: !ok });
  }
  if (sub === 'pause') {
    const ok = pause(gid);
    return interaction.reply({ embeds: [musicEmbed({ title: ok ? 'Paused ⏸️' : 'Nothing is playing', color: Colors.Yellow })] });
  }
  if (sub === 'resume') {
    const ok = resume(gid);
    return interaction.reply({ embeds: [musicEmbed({ title: ok ? 'Resumed ▶️' : 'Nothing is playing', color: Colors.Green })] });
  }
  if (sub === 'stop') {
    stopAll(gid);
    return interaction.reply({ embeds: [musicEmbed({ title: 'Stopped & left the voice channel 🛑', color: Colors.Red })] });
  }
  if (sub === 'volume') {
    const v = Math.max(0, Math.min(100, interaction.options.getInteger('level')));
    setVolume(gid, v);
    return interaction.reply({ embeds: [musicEmbed({ title: `Volume set to ${v}% 🔊`, color: Colors.Blurple })] });
  }
  if (sub === 'np') {
    const s = musicSession(gid);
    if (!s?.current) return interaction.reply({ embeds: [musicEmbed({ title: 'Nothing is playing right now', color: Colors.Greyple })], ephemeral: true });
    return interaction.reply({ embeds: [musicEmbed({ title: 'Now playing', track: s.current, color: Colors.Green })] });
  }
  // queue
  const { current, queue, total } = queueList(gid);
  if (!current && !queue.length) {
    return interaction.reply({ embeds: [musicEmbed({ title: 'Queue is empty', desc: 'Use /play to add songs.', color: Colors.Greyple })], ephemeral: true });
  }
  const em = new EmbedBuilder()
    .setColor(Colors.Purple)
    .setTitle(`${E.pmusic ?? '🎵'} Music Queue (${total} upcoming)`)
    .setTimestamp()
    .setFooter({ text: 'RizokMC Music' });
  if (current) em.setDescription(`**Now playing:** [${current.title.slice(0, 80)}](${current.url}) \`${current.durationRaw ?? ''}\``);
  if (queue.length) {
    em.addFields({
      name: 'Up next',
      value: queue.map((t, i) => `**${i + 1}.** [${t.title.slice(0, 60)}](${t.url}) \`${t.durationRaw ?? ''}\` — <@${t.requestedBy}>`).join('\n'),
    });
  }
  if (total > queue.length) em.setFooter({ text: `...and ${total - queue.length} more in queue` });
  return interaction.reply({ embeds: [em] });
}
