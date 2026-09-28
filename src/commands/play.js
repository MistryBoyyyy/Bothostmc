import { SlashCommandBuilder, Colors } from 'discord.js';
import { playTrack, musicEmbed } from '../music.js';

export const data = new SlashCommandBuilder()
  .setName('play')
  .setDescription('🎵 Play any song from YouTube in your voice channel')
  .addStringOption((o) => o.setName('query').setDescription('Song name or YouTube link').setRequired(true));

export async function execute(interaction) {
  try {
    await interaction.deferReply();
    const query = interaction.options.getString('query');
    const res = await playTrack(interaction.member, query, interaction.channel);
    if (res.error) {
      return interaction.editReply({ embeds: [musicEmbed({ title: 'Music', desc: `❌ ${res.error}`, color: Colors.Red })] });
    }
    if (res.queued) {
      return interaction.editReply({ embeds: [musicEmbed({ title: `Added to queue (#${res.queued})`, track: res.track, color: Colors.Blurple })] });
    }
    return interaction.editReply({ embeds: [musicEmbed({ title: 'Now playing', track: res.track, color: Colors.Green })] });
  } catch (e) {
    console.error('/play error:', e);
    const msg = { embeds: [musicEmbed({ title: 'Music', desc: `❌ Error: ${String(e.message).slice(0, 150)}`, color: Colors.Red })] };
    if (interaction.deferred || interaction.replied) return interaction.followUp(msg).catch(() => {});
    return interaction.reply(msg).catch(() => {});
  }
}
