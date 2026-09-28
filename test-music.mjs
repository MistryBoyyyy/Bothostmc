// End-to-end music pipeline test: join VC, stream YouTube, verify playback.
import 'dotenv/config';
import { Client, GatewayIntentBits } from 'discord.js';
import { playTrack, musicSession, stopAll } from './src/music.js';

const GUILD = '1539606347513860186';
const VC = '1539608030747041823';

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates] });
client.on('ready', async () => {
  const guild = await client.guilds.fetch(GUILD);
  const vc = guild.channels.cache.get(VC);
  const fakeMember = { guild, voice: { channel: vc }, id: client.user.id };
  const fakeText = { send: (o) => console.log('  [channel msg]', o.embeds?.[0]?.data?.title) };

  console.log('Searching + streaming...');
  const res = await playTrack(fakeMember, 'https://www.youtube.com/watch?v=aqz-KE-bpKQ', fakeText);
  if (res.error) { console.log('ERROR:', res.error); process.exit(1); }
  console.log('Track:', res.track?.title, '| url:', res.track?.url);

  await new Promise((r) => setTimeout(r, 8000));
  const s = musicSession(GUILD);
  console.log('Player status:', s.player.state.status);
  console.log('Current:', s.current?.title);
  console.log(s.player.state.status === 'playing' ? '✅ AUDIO PIPELINE WORKS' : '❌ NOT PLAYING');
  stopAll(GUILD);
  client.destroy();
  process.exit(0);
});
client.login(process.env.DISCORD_TOKEN);
