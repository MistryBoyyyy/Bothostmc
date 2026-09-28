// Reaction-based giveaways — PREMIUM animated design, persistence across restarts
import { EmbedBuilder, Colors } from 'discord.js';
import { getGiveaways, addGiveaway, updateGiveaway } from './store.js';
import E, { reactionKey } from './premium.js';

const DEFAULT_REACTION = '🎉';

function parseDuration(str) {
  const re = /(\d+)\s*(s|sec|secs|second|seconds|m|min|mins|minute|minutes|h|hr|hrs|hour|hours|d|day|days)/gi;
  let ms = 0;
  let match;
  let matched = false;
  while ((match = re.exec(str)) !== null) {
    matched = true;
    const n = parseInt(match[1], 10);
    const unit = match[2].toLowerCase();
    if (unit.startsWith('s')) ms += n * 1000;
    else if (unit.startsWith('m')) ms += n * 60_000;
    else if (unit.startsWith('h')) ms += n * 3600_000;
    else if (unit.startsWith('d')) ms += n * 86400_000;
  }
  return matched ? ms : null;
}

export { parseDuration };

export function buildGiveawayEmbed({ prize, winners, endTime, reaction, hostName }) {
  const embed = new EmbedBuilder()
    .setColor(Colors.Gold)
    .setAuthor({ name: 'P R E M I U M ・ G I V E A W A Y' })
    .setTitle(`${E.pgem}  「 ${prize} 」  ${E.pgem}`);
  if (E.banner_giveaway) embed.setImage(E.banner_giveaway);
  return embed
    .setDescription(
      `${E.pfire}   **React with ${reaction} to enter!**\n` +
      `${E.psparkle} ─────────────────────────────\n` +
      `${E.pgift}   **Prize** ❯ ${prize}\n` +
      `${E.ptrophy}   **Winners** ❯ ${winners}\n` +
      `${E.phourglass}   **Ends In** ❯ <t:${Math.floor(endTime / 1000)}:R>\n` +
      `${E.psparkle}   **End Date** ❯ <t:${Math.floor(endTime / 1000)}:F>\n` +
      `${E.pcrown}   **Hosted By** ❯ ${hostName}\n` +
      `${E.psparkle} ─────────────────────────────\n` +
      `*Good luck!* ${E.psparkle}`
    )
    .setFooter({ text: 'MC-Security • Premium Giveaways' })
    .setTimestamp(endTime);
}

export async function createGiveaway({ channel, guildId, prize, winners, endTime, hostId, hostName, reaction }) {
  const emoji = reaction || DEFAULT_REACTION;
  const embed = buildGiveawayEmbed({ prize, winners, endTime, reaction: emoji, hostName });
  const msg = await channel.send({ embeds: [embed] });
  await msg.react(emoji);

  addGiveaway({
    messageId: msg.id,
    channelId: channel.id,
    guildId,
    endTime,
    prize,
    winners,
    hostId,
    reaction: emoji,
    reactionKey: reactionKey(emoji),
    ended: false,
  });
  return msg;
}

export async function startGiveaway(interaction, { channel, durationStr, winners, prize, reaction }) {
  const ms = parseDuration(durationStr);
  if (!ms || ms < 10_000) {
    await interaction.reply({ content: '❌ Invalid duration. Use formats like `30s`, `10m`, `2h`, `1d` (minimum 10s).', ephemeral: true });
    return;
  }
  const endTime = Date.now() + ms;

  try {
    await createGiveaway({
      channel,
      guildId: interaction.guild.id,
      prize,
      winners,
      endTime,
      hostId: interaction.user.id,
      hostName: `${interaction.user}`,
      reaction,
    });
  } catch (e) {
    await interaction.reply({ content: `❌ Could not start giveaway — is that a valid emoji? (${e.message})`, ephemeral: true });
    return;
  }

  await interaction.reply({ content: `${E.pgem} Giveaway started in ${channel}!`, ephemeral: true });
}

async function fetchEntrants(message, key) {
  const users = [];
  // reactions come with the message payload; users need per-reaction fetch
  for (const reaction of message.reactions.cache.values()) {
    const rkey = reaction.emoji.id ?? reaction.emoji.name;
    if (String(rkey) !== String(key)) continue;
    let after;
    for (;;) {
      const batch = await reaction.users.fetch({ limit: 100, ...(after ? { after } : {}) });
      users.push(...batch.values());
      if (batch.size < 100) break;
      after = batch.lastKey();
    }
  }
  return users.filter((u) => !u.bot);
}

function pickWinners(entrants, count, hostId) {
  const pool = entrants.filter((u) => u.id !== hostId);
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

export async function endGiveaway(client, messageId, { reroll = false } = {}) {
  const gw = getGiveaways().find((g) => g.messageId === messageId);
  if (!gw || (gw.ended && !reroll)) return { ok: false, msg: 'Giveaway not found or already ended.' };

  const channel = await client.channels.fetch(gw.channelId).catch(() => null);
  if (!channel) return { ok: false, msg: 'Could not find the giveaway channel.' };
  const message = await channel.messages.fetch(messageId).catch(() => null);
  if (!message) return { ok: false, msg: 'Could not find the giveaway message.' };

  const key = gw.reactionKey ?? reactionKey(gw.reaction) ?? DEFAULT_REACTION;
  const entrants = await fetchEntrants(message, key);
  const winners = pickWinners(entrants, gw.winners, gw.hostId);

  const endEmbed = EmbedBuilder.from(message.embeds[0] ?? new EmbedBuilder())
    .setColor(Colors.DarkGrey)
    .setThumbnail(E.url_trophy)
    .setDescription(
      `${E.psparkle} ─────────────────────────────\n` +
      `${E.pgift}   **Prize** ❯ ${gw.prize}\n` +
      `${E.ptrophy}   **Winner(s)** ❯ ${winners.length ? winners.join(', ') : 'No valid entries 😢'}\n` +
      `${E.pgift}   **Entries** ❯ ${entrants.length}\n` +
      `${E.pcrown}   **Host** ❯ <@${gw.hostId}>\n` +
      `${E.psparkle} ─────────────────────────────`
    )
    .setFooter({ text: reroll ? 'Giveaway ended (rerolled) • MC-Security' : 'Giveaway ended • MC-Security' });
  await message.edit({ embeds: [endEmbed] }).catch(() => {});

  if (winners.length) {
    await channel.send(`${E.ptrophy} Congratulations ${winners.join(', ')}! You won **${gw.prize}**! ${E.psparkle}`).catch(() => {});
  } else {
    await channel.send(`😢 The giveaway for **${gw.prize}** ended with no valid entries.`).catch(() => {});
  }

  updateGiveaway(messageId, { ended: true });
  return { ok: true, winners };
}

export function startGiveawayChecker(client) {
  setInterval(async () => {
    const now = Date.now();
    for (const gw of getGiveaways()) {
      if (!gw.ended && gw.endTime <= now) {
        await endGiveaway(client, gw.messageId).catch((e) =>
          console.error('[giveaway] end error:', e.message)
        );
      }
    }
  }, 15_000);
  console.log('[giveaways] checker started');
}
