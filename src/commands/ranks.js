import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const data = new SlashCommandBuilder()
  .setName('ranks')
  .setDescription('View RizokMC store ranks, prices & perks');

export async function execute(interaction) {
  let cfg;
  try { cfg = JSON.parse(readFileSync(path.join(__dirname, '..', '..', 'data', 'ranks.json'), 'utf8')); } catch { cfg = { ranks: [] }; }
  const embed = new EmbedBuilder()
    .setTitle('🏆 RIZOKMC — STORE RANKS')
    .setColor(0xffd700)
    .setDescription('⛏️ Minecraft Server: **play.rizokmc.fun** (Java + Bedrock)\n📈 Har agle rank me **+1 Home, +1 Vault, +1 Auction slot**');
  for (const r of cfg.ranks) {
    embed.addFields({
      name: `${r.emoji} ${r.name} — ₹${r.price}`,
      value: `🏠 ${r.perks.homes} Homes • 🛒 ${r.perks.auctions} Auction Slots • 🗄️ ${r.perks.vaults} Vaults • 💺 /sit • ⚔️ Kits`,
    });
  }
  embed.setFooter({ text: '🛒 Kharidne ke liye 🎫 support ticket kholo!' });
  await interaction.reply({ embeds: [embed] });
}
