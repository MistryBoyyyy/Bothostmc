// Ticket system — RizokMC Support: panel, per-user support channels, close button
import {
  ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType,
  EmbedBuilder, Colors, PermissionFlagsBits,
} from 'discord.js';
import { getGuildConfig } from './store.js';
import { logToModlog, fmtUser } from './util.js';
import E from './premium.js';

export const BTN_OPEN = 'mc_ticket_open';
export const BTN_CLOSE = 'mc_ticket_close';

export function ticketPanelEmbed() {
  return new EmbedBuilder()
    .setColor(Colors.Blurple)
    .setAuthor({ name: 'R I Z O K M C ・ S U P P O R T' })
    .setDescription(
      `${E.pticket}  **Need help? Open a private ticket with the staff team.**\n` +
      `${E.psparkle} ─────────────────────────────\n` +
      `${E.pcrown}  **Rules:**\n` +
      `• One ticket per person\n` +
      `• Explain your issue clearly\n` +
      `• Be patient — staff will respond ASAP\n` +
      `${E.psparkle} ─────────────────────────────`
    )
    .setFooter({ text: 'RizokMC Support' });
}

export function ticketPanelRow() {
  const btn = new ButtonBuilder()
    .setCustomId(BTN_OPEN)
    .setLabel('Open a Ticket')
    .setStyle(ButtonStyle.Primary);
  const m = E.pticket?.match(/:(\d+)>$/);
  if (m) btn.setEmoji({ id: m[1], animated: true });
  return new ActionRowBuilder().addComponents(btn);
}

function staffRoleIds(guild) {
  return guild.roles.cache
    .filter((r) =>
      r.id !== guild.id &&
      !r.managed &&
      (r.permissions.has(PermissionFlagsBits.Administrator) ||
        r.permissions.has(PermissionFlagsBits.ModerateMembers) ||
        r.permissions.has(PermissionFlagsBits.ManageMessages))
    )
    .map((r) => r.id);
}

export async function handleOpenButton(interaction) {
  const { guild, user } = interaction;
  const cfg = getGuildConfig(guild.id);

  const existing = guild.channels.cache.find(
    (c) => c.name === `support-${user.username.toLowerCase()}` && c.parentId === (cfg.ticketCategory ?? undefined)
  );
  if (existing) {
    await interaction.reply({ content: `${E.pticket} You already have an open ticket: ${existing}`, ephemeral: true });
    return;
  }

  const overwrites = [
    { id: guild.id, deny: [PermissionFlagsBits.ViewChannel] },
    {
      id: user.id,
      allow: [
        PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages,
        PermissionFlagsBits.AttachFiles, PermissionFlagsBits.EmbedLinks,
        PermissionFlagsBits.ReadMessageHistory,
      ],
    },
    {
      id: guild.members.me.id,
      allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ManageChannels],
    },
    ...staffRoleIds(guild).map((id) => ({
      id,
      allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory],
    })),
  ];

  const channel = await guild.channels.create({
    name: `support-${user.username.toLowerCase()}`,
    type: ChannelType.GuildText,
    parent: cfg.ticketCategory ?? undefined,
    permissionOverwrites: overwrites,
    topic: `RizokMC Support ticket by ${user.tag} (${user.id})`,
  });

  const lockId = E.plock?.match(/:(\d+)>$/)?.[1];
  const closeBtn = new ButtonBuilder().setCustomId(BTN_CLOSE).setLabel('Close Ticket').setStyle(ButtonStyle.Danger);
  if (lockId) closeBtn.setEmoji({ id: lockId, animated: true });

  await channel.send({
    content: `${user} — welcome to **RizokMC Support**!`,
    embeds: [
      new EmbedBuilder()
        .setColor(Colors.Blurple)
        .setAuthor({ name: 'R I Z O K M C ・ S U P P O R T' })
        .setDescription(`${E.pticket}  ${user}, please describe your issue. Our staff will be with you shortly.\n${E.plock}  To close this ticket, press the button below.`),
    ],
    components: [new ActionRowBuilder().addComponents(closeBtn)],
  });

  await interaction.reply({ content: `${E.pticket} Your support ticket is ready: ${channel}`, ephemeral: true });
  await logToModlog(guild, {
    title: '🎟️ Ticket created',
    description: `**User:** ${fmtUser(user)}\n**Channel:** ${channel} (${channel.name})\n**Action:** Ticket channel created`,
    color: Colors.Green,
  });
}

export async function handleCloseButton(interaction) {
  const { channel } = interaction;
  if (!channel.name.startsWith('support-') && !channel.name.startsWith('ticket-')) {
    await interaction.reply({ content: '❌ This button only works in support tickets.', ephemeral: true });
    return;
  }
  await interaction.reply({ content: `${E.plock} Closing this ticket in **5 seconds**...` });
  await logToModlog(interaction.guild, {
    title: '🔒 Ticket closed',
    description: `**Closed by:** ${fmtUser(interaction.user)}\n**Channel:** ${channel} (${channel.name})\n**Action:** Ticket channel deleting`,
    color: Colors.Red,
  });
  setTimeout(() => channel.delete('Ticket closed').catch(() => {}), 5000);
}
