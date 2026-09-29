import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const data = new SlashCommandBuilder()
  .setName('ranks')
  .setDescription('View RizokMC store ranks, prices & perks');

const TIER = { ash: 'Starter Tier', ember: 'Rising Tier', inferno: 'Elite Tier', flame: 'Legend Tier', divine: 'Ultimate Tier' };

export async function execute(interaction) {
  let cfg, emo;
  try {
    cfg = JSON.parse(readFileSync(path.join(__dirname, '..', '..', 'data', 'ranks.json'), 'utf8'));
    emo = JSON.parse(readFileSync(path.join(__dirname, '..', '..', 'data', 'premium-emojis.json'), 'utf8'));
  } catch { return interaction.reply({ content: '❌ Store is loading, try again shortly.', ephemeral: true }); }
  const M = {};
  for (const [, v] of Object.entries(emo)) if (v && v.id && v.name) M[v.name] = v.id;
  for (const v of emo.vault || []) if (v.id && v.name) M[v.name] = v.id;
  const t = (n) => (M[n] ? `<a:${n}:${M[n]}>` : '•');

  const embed = new EmbedBuilder()
    .setTitle(`${t('pcrown')} THE RIZOKMC STORE`)
    .setColor(0xffd700)
    .setDescription('**⛏️ Minecraft Java + Bedrock — `play.rizokmc.fun`**\n*Every tier adds: +1 Home • +1 Vault • +1 Auction Slot*');
  for (const r of cfg.ranks) {
    embed.addFields({
      name: `${t('mc_arrow_white')} ${r.name} — ${TIER[r.key] || ''} — **₹${r.price}**`,
      value: `${t('mc_portal')} ${r.perks.homes} Homes • ${t('plock')} ${r.perks.vaults} Vaults • ${t('mc_arrow_blue')} ${r.perks.auctions} Auctions • ${t('pstar')} /sit • ${t('psword')} Kits`,
    });
  }
  embed.setFooter({ text: `${'🛒'} To purchase — open a support ticket! • RizokMC Store` });
  await interaction.reply({ embeds: [embed] });
}
