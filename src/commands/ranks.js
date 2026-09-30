import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const data = new SlashCommandBuilder()
  .setName('ranks')
  .setDescription('View RizokMC store ranks, prices & perks');

const TIER = { ash: 'Starter', ember: 'Rising', flame: 'Elite', inferno: 'Legend', divine: 'Ultimate' };
const SC = {
  a: 'ᴀ', b: 'ʙ', c: 'ᴄ', d: 'ᴅ', e: 'ᴇ', f: 'ꜰ', g: 'ɢ', h: 'ʜ', i: 'ɪ', j: 'ᴊ',
  k: 'ᴋ', l: 'ʟ', m: 'ᴍ', n: 'ɴ', o: 'ᴏ', p: 'ᴘ', q: 'ǫ', r: 'ʀ', s: 'ꜱ', t: 'ᴛ',
  u: 'ᴜ', v: 'ᴠ', w: 'ᴡ', x: 'x', y: 'ʏ', z: 'ᴢ',
};
const small = (s) => String(s).toLowerCase().replace(/[a-z]/g, (c) => SC[c] || c);

export async function execute(interaction) {
  let cfg, emo, guildEmo;
  try {
    cfg = JSON.parse(readFileSync(path.join(__dirname, '..', '..', 'data', 'ranks.json'), 'utf8'));
    emo = JSON.parse(readFileSync(path.join(__dirname, '..', '..', 'data', 'premium-emojis.json'), 'utf8'));
    guildEmo = JSON.parse(readFileSync(path.join(__dirname, '..', '..', 'data', 'guild-emojis.json'), 'utf8'));
  } catch { return interaction.reply({ content: '❌ Store is loading, try again shortly.', ephemeral: true }); }
  const M = {};
  for (const [, v] of Object.entries(emo)) if (v && v.id && v.name) M[v.name] = v.id;
  for (const v of emo.vault || []) if (v.id && v.name) M[v.name] = v.id;
  for (const v of guildEmo || []) if (v.id && v.name) M[v.name] = v.id;
  const t = (n) => (M[n] ? `<a:${n}:${M[n]}>` : '•');

  const ranks = [...cfg.ranks].sort((a, b) => a.price - b.price);
  const embed = new EmbedBuilder()
    .setTitle(`${t('pcrown')} ${small('THE RIZOKMC STORE')}`)
    .setColor(0xffd700)
    .setDescription(`${t('ppick')} **${small('Java + Bedrock')}** — \`play.rizokmc.fun\`\n*${small('Bedrock port')} \`25609\` • ${small('each tier adds')} +1 ${small('home, vault, auction')}*`);
  for (const r of ranks) {
    const ec = r.perks.enderchest ? `\n${t('mc_enderchest')} **/enderchest** — ${small('personal storage')}` : '';
    embed.addFields({
      name: `${t('mc_arrow_right')} ${small(r.name)} — ${small(TIER[r.key] || '')} — **₹${r.price}**`,
      value: `${t('mc_portal')} **${r.perks.homes}** ${small('homes')} • ${t('plock')} **${r.perks.vaults}** ${small('vaults')} • ${t('mc_arrow_blue')} **${r.perks.auctions}** ${small('auctions')}\n${t('pstar')} **/sit** • ${t('psword')} ${small('kits')}${ec}`,
    });
  }
  embed.setFooter({ text: '🛒 Open a support ticket to purchase • RizokMC Store' });
  await interaction.reply({ embeds: [embed] });
}
