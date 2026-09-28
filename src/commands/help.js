import { SlashCommandBuilder, EmbedBuilder, Colors } from 'discord.js';

const COMMANDS = [
  ['🛡️ Moderation', [
    '`/warn <user> [reason]` — Warn a member',
    '`/warnings <user>` — View a member\'s warnings',
    '`/delwarn <user> <warn-id>` — Delete a warning',
    '`/timeout <user> <minutes> [reason]` — Timeout a member',
    '`/untimeout <user>` — Remove timeout',
    '`/kick <user> [reason]` — Kick a member',
    '`/ban <user> [reason] [delete-days]` — Ban a member',
    '`/unban <user-id> [reason]` — Unban a user',
    '`/purge <count> [user]` — Bulk delete messages',
  ]],
  ['🧰 Utility', [
    '`/announce <title> <message> [channel]` — Fancy announcement (admin)',
    '`/poll <question> <options...>` — Reaction poll',
    '`/slowmode <seconds>` — Set slowmode',
    '`/lock` / `/unlock` — Lock/unlock a channel',
    '`/nick <user> [name]` — Change nickname',
    '`/addrole` / `/removerole` — Role management',
    '`/report <user> <reason>` — Report a user to staff',
    '`/afk [reason]` — Go AFK (pings will notify)',
  ]],
  ['📊 Info', [
    '`/userinfo [user]` — Member info',
    '`/serverinfo` — Server info',
    '`/membercount` — Member breakdown',
    '`/avatar [user]` — Avatar in full size',
    '`/botstats` — Bot statistics',
    '`/ping` — Bot latency',
  ]],
  ['📨 Invites & Welcome', [
    '`/ip` — Minecraft server IP',
    '`/invites [user]` — Check invite count',
    '`/invites-manage add|remove|reset` — Adjust counts (admin)',
    '`/invite-leaderboard` — Top 10 inviters',
    '`/welcome-setup <channel> [message]` — Set welcome channel (admin)',
    '`/autorole <role>` — Auto role on join (admin)',
  ]],
  ['⏱️ Timers & Activity', [
    '`/timer start <name> <duration> [msg]` — Event timer',
    '`/timer pause|resume|end <name>` — Control timers',
    '`/timer list` — Running timers',
    '`/messages [user]` — Message count',
    '`/message-leaderboard` — Most active members',
  ]],
  ['🎉 Giveaways & Tickets', [
    '`/giveaway start <channel> <duration> <winners> <prize>` — Start a giveaway',
    '`/giveaway end|reroll <message-id>` — End / reroll',
    '`/ticket-setup [category]` — Post ticket panel (admin)',
  ]],
  ['⚙️ Configuration', [
    '`/setmodlog <channel|off>` — Set moderation log channel',
    '`/config view` — View security settings',
    '`/config antispam <on|off>` — Toggle anti-spam',
    '`/config antimention <on|off>` — Toggle anti mass-mention',
  ]],
];

export const data = new SlashCommandBuilder()
  .setName('help')
  .setDescription('Show all MC-Security commands');

export async function execute(interaction) {
  const embed = new EmbedBuilder()
    .setColor(Colors.Blurple)
    .setTitle('🛡️ MC-Security — Help')
    .setDescription('Security, invites & welcome, giveaways, tickets — all in one bot. Anti-spam, anti mass-mention and raid alerts run automatically.')
    .setFooter({ text: 'MC-Security' });

  for (const [name, lines] of COMMANDS) embed.addFields({ name, value: lines.join('\n') });

  await interaction.reply({ embeds: [embed] });
}
