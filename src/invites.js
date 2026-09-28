// Invite tracking: cache invites, diff on join to find the inviter
import { Collection } from 'discord.js';
import { recordInvite, recordFake, recordLeave, setInviteeMap, getInviterOf } from './store.js';

// guildId -> Map(code -> uses)
const cache = new Collection();

export async function cacheGuildInvites(guild) {
  try {
    const invites = await guild.invites.fetch();
    const map = new Map();
    for (const [code, inv] of invites) map.set(code, inv.uses ?? 0);
    cache.set(guild.id, map);
  } catch (err) {
    console.error(`[invites] could not cache for ${guild.name}:`, err.message);
  }
}

export async function cacheAllInvites(client) {
  for (const guild of client.guilds.cache.values()) await cacheGuildInvites(guild);
  console.log(`[invites] cached invites for ${cache.size} guild(s)`);
}

export function onInviteCreate(invite) {
  const map = cache.get(invite.guild.id);
  if (map) map.set(invite.code, invite.uses ?? 0);
}

export function onInviteDelete(invite) {
  const map = cache.get(invite.guild.id);
  if (map) map.delete(invite.code);
}

// Returns { inviter: GuildMember|null, code, uses, vanity }
export async function findInviter(member) {
  const { guild } = member;
  const oldMap = cache.get(guild.id);

  let current;
  try {
    current = await guild.invites.fetch();
  } catch {
    current = null;
  }

  let found = null;

  if (oldMap && current) {
    for (const [code, inv] of current) {
      const oldUses = oldMap.get(code);
      if (oldUses !== undefined && (inv.uses ?? 0) > oldUses) {
        found = { code, inviterId: inv.inviter?.id ?? null };
        break;
      }
      // brand-new invite created and already used by this member
      if (oldUses === undefined && (inv.uses ?? 0) > 0 && inv.temporary === false) {
        // only trust if it is the ONLY candidate
        found = { code, inviterId: inv.inviter?.id ?? null };
      }
    }
    // refresh cache with fresh counts
    for (const [code, inv] of current) oldMap.set(code, inv.uses ?? 0);
  }

  if (found?.inviterId && found.inviterId !== member.id) {
    const inviter = await guild.members.fetch(found.inviterId).catch(() => null);
    if (inviter) {
      // fake invite detection (port: Falcon-Premium) — new accounts don't count
      const fake = Date.now() - member.user.createdTimestamp < 7 * 86400_000;
      if (fake) {
        recordFake(guild.id, inviter.id);
      } else {
        recordInvite(guild.id, inviter.id, found.code);
      }
      setInviteeMap(guild.id, member.id, inviter.id);
      return { inviter, code: found.code, fake };
    }
  }
  return { inviter: null, code: found?.code ?? null, vanity: !found, fake: false };
}

export async function handleMemberRemove(member) {
  const inviterId = getInviterOf(member.guild.id, member.id);
  if (inviterId) recordLeave(member.guild.id, member.id, inviterId);
}
