// RizokMC premium role system v2 — decorated names, dividers, both owners.
import 'dotenv/config';
import fs from 'fs';
import { Client, GatewayIntentBits, PermissionFlagsBits, REST, Routes } from 'discord.js';

const GUILD = '1539606347513860186';
const rest = new REST().setToken(process.env.DISCORD_TOKEN);
// A-Z -> Mathematical Bold Serif (elegant premium look)
const F = (s) => s.replace(/[A-Z]/g, (c) => String.fromCodePoint(0x1d400 + (c.charCodeAt(0) - 65)));
const DIV = (t) => `──────── 𓆩 ${F(t)} 𓆪 ────────`;

// Creation order = bottom -> top (each new role lands above previous)
const PLAN = [
  { key: 'member', name: `𓆩🎮𓆪 ${F('MEMBER')}`, color: 0x99aab5, hoist: false, mentionable: false, perms: [] },
  { key: 'fans', name: `𓆩💎𓆪 ${F('FANS')}`, color: 0xff6ec7, hoist: true, mentionable: true, perms: [] },
  { key: 'divCommunity', name: DIV('COMMUNITY'), color: 0x2b2d31, hoist: false, mentionable: false, perms: [] },
  {
    key: 'helper', name: `𓆩🤝𓆪 ${F('HELPER')}`, color: 0x43b581, hoist: true, mentionable: false,
    perms: [PermissionFlagsBits.ManageMessages, PermissionFlagsBits.ModerateMembers, PermissionFlagsBits.ViewAuditLog],
  },
  {
    key: 'staff', name: `𓆩🛡️𓆪 ${F('STAFF')}`, color: 0xf04747, hoist: true, mentionable: false,
    perms: [
      PermissionFlagsBits.KickMembers, PermissionFlagsBits.BanMembers, PermissionFlagsBits.ModerateMembers,
      PermissionFlagsBits.ManageMessages, PermissionFlagsBits.ManageThreads, PermissionFlagsBits.ManageNicknames,
      PermissionFlagsBits.ViewAuditLog, PermissionFlagsBits.DeafenMembers, PermissionFlagsBits.MoveMembers,
      PermissionFlagsBits.PrioritySpeaker,
    ],
  },
  {
    key: 'developer', name: `𓆩💻𓆪 ${F('DEVELOPER')}`, color: 0xa855f7, hoist: true, mentionable: false,
    perms: [
      PermissionFlagsBits.ManageGuild, PermissionFlagsBits.ManageChannels, PermissionFlagsBits.ManageThreads,
      PermissionFlagsBits.ManageWebhooks, PermissionFlagsBits.ManageEmojisAndStickers,
      PermissionFlagsBits.ManageEvents, PermissionFlagsBits.ViewAuditLog,
    ],
  },
  { key: 'divTeam', name: DIV('TEAM'), color: 0x2b2d31, hoist: false, mentionable: false, perms: [] },
  { key: 'coowner', name: `𓆩⚡𓆪 ${F('CO-OWNER')}`, color: 0xff8c00, hoist: true, mentionable: false, perms: [PermissionFlagsBits.Administrator] },
  { key: 'owner', name: `𓆩👑𓆪 ${F('OWNER')}`, color: 0xffd700, hoist: true, mentionable: false, perms: [PermissionFlagsBits.Administrator] },
  { key: 'divMgmt', name: DIV('MANAGEMENT'), color: 0x2b2d31, hoist: false, mentionable: false, perms: [] },
];

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.on('ready', async () => {
  const guild = await client.guilds.fetch(GUILD);
  const botRole = guild.members.me.roles.botRole;
  console.log(`Bot role: ${botRole.name} @ position ${botRole.position}`);

  // 1) Rename bot role to RizokMC (best effort)
  try { await botRole.setName('🤖 RizokMC'); console.log('Bot role renamed ✅'); } catch (e) { console.log('Bot role rename skipped:', e.message); }

  // 2) Delete EVERY role except @everyone and managed bot roles
  const failed = []; let deleted = 0;
  for (const role of guild.roles.cache.values()) {
    if (role.id === guild.id || role.managed) continue;
    try { await role.delete('RizokMC premium roles'); deleted++; }
    catch (e) { failed.push(`${role.name} (${e.code})`); }
  }
  console.log(`Deleted ${deleted} old roles.${failed.length ? ' FAILED: ' + failed.join(', ') : ''}`);

  // 3) Create new premium roles (bottom -> top)
  const made = {};
  for (const p of PLAN) {
    made[p.key] = await guild.roles.create({
      name: p.name, colors: { primaryColor: p.color }, hoist: p.hoist, mentionable: p.mentionable,
      permissions: p.perms.length ? p.perms : [], reason: 'RizokMC premium roles',
    });
    console.log(`Created: ${made[p.key].name}`);
  }

  // 4) Give OWNER role to spacygaming AND vexaro_mc
  for (const q of ['spacy', 'vexaro']) {
    const hits = await rest.get(Routes.guildMembersSearch(GUILD, { query: q, limit: 5 }));
    if (!hits.length) { console.log(`⚠ No member found for "${q}"`); continue; }
    const m = hits[0];
    await rest.put(Routes.guildMemberRole(GUILD, m.user.id, made.owner.id));
    console.log(`👑 OWNER role -> ${m.user.global_name ?? m.user.username} (${m.user.username})`);
  }

  // 5) Update config: autorole + ticket staff
  const cfgPath = new URL('./data/guilds.json', import.meta.url);
  const data = JSON.parse(fs.readFileSync(cfgPath, 'utf8'));
  const g = data[GUILD] ??= {};
  g.autorole = made.member.id;
  g.ticketStaffRoles = [made.developer.id, made.staff.id, made.helper.id];
  fs.writeFileSync(cfgPath, JSON.stringify(data, null, 2));
  console.log('Config updated (autorole + ticket staff) ✅');

  // 6) Final hierarchy
  console.log('\nFINAL HIERARCHY (top -> bottom):');
  const fresh = await guild.roles.fetch();
  for (const r of fresh.sort((a, b) => b.position - a.position).values()) console.log(` ${String(r.position).padStart(2)} | ${r.name}`);
  client.destroy();
});

client.login(process.env.DISCORD_TOKEN);
