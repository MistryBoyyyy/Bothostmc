// Anti-nuke: detect mass channel/role deletion by compromised accounts -> ban + alert
import { AuditLogEvent, Colors } from 'discord.js';
import { getGuildConfig } from './store.js';
import { logToModlog, fmtUser } from './util.js';

// guildId -> last action ts (avoid spam)
const cooldown = new Map();

async function check(guild, executor, action) {
  if (!executor || executor.id === guild.ownerId || executor.bot) return;
  const cfg = getGuildConfig(guild.id);
  if (!cfg.antinuke) return;

  const member = await guild.members.fetch(executor.id).catch(() => null);
  if (!member) return;
  // trusted = owner-level roles or explicit whitelist
  if (cfg.nukeWhitelist?.includes(executor.id)) return;

  const now = Date.now();
  if (now - (cooldown.get(guild.id) ?? 0) < 10_000) return;
  cooldown.set(guild.id, now);

  // act: ban the nuker
  let acted = false;
  if (member.bannable) {
    await member.ban({ reason: `Anti-nuke: ${action}` }).then(() => { acted = true; }).catch(() => {});
  }

  await logToModlog(guild, {
    title: '🚨 ANTI-NUKE TRIGGERED',
    description:
      `**Executor:** ${fmtUser(executor)}\n` +
      `**Action detected:** ${action}\n` +
      `**Response:** ${acted ? 'Executor BANNED immediately' : 'Could not ban (role hierarchy) — check manually!'}\n` +
      `⚠️ If this was legit staff activity, add them to whitelist via \`/config nukewhitelist <user>\`.`,
    color: Colors.DarkRed,
  });
  // alert in modlog channel too even if action failed
  console.log(`[antinuke] ${action} by ${executor.tag} in ${guild.name} -> ${acted ? 'banned' : 'not bannable'}`);
}

export async function onChannelDelete(channel) {
  if (!channel?.guild) return;
  try {
    const logs = await channel.guild.fetchAuditLogs({ type: AuditLogEvent.ChannelDelete, limit: 1 });
    const entry = logs.entries.first();
    if (entry && Date.now() - entry.createdTimestamp < 10_000) {
      await check(channel.guild, entry.executor, `Channel deleted: #${channel.name}`);
    }
  } catch { /* no audit log access */ }
}

export async function onRoleDelete(role) {
  if (!role?.guild) return;
  try {
    const logs = await role.guild.fetchAuditLogs({ type: AuditLogEvent.RoleDelete, limit: 1 });
    const entry = logs.entries.first();
    if (entry && Date.now() - entry.createdTimestamp < 10_000) {
      await check(role.guild, entry.executor, `Role deleted: @${role.name}`);
    }
  } catch { /* ignore */ }
}

export async function onGuildBanAdd(ban) {
  // mass-ban detection: 3+ bans in 10s by same executor
  const guild = ban.guild;
  try {
    const logs = await guild.fetchAuditLogs({ type: AuditLogEvent.MemberBanAdd, limit: 5 });
    const recent = [...logs.entries.values()].filter((e) => Date.now() - e.createdTimestamp < 10_000);
    const byExec = new Map();
    for (const e of recent) byExec.set(e.executor?.id, (byExec.get(e.executor?.id) ?? 0) + 1);
    for (const [id, count] of byExec) {
      if (count >= 3) {
        const executor = await guild.client.users.fetch(id).catch(() => null);
        if (executor) await check(guild, executor, `Mass ban (${count} bans in 10s)`);
      }
    }
  } catch { /* ignore */ }
}
