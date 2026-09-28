import {
  SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, Colors,
} from 'discord.js';
import { getGuildConfig, setGuildConfig } from '../store.js';

export const data = new SlashCommandBuilder()
  .setName('config')
  .setDescription('View or change MC-Security security settings')
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
  .addSubcommand((s) => s.setName('view').setDescription('Show current settings'))
  .addSubcommand((s) =>
    s.setName('antispam')
      .setDescription('Toggle anti-spam (rapid messages)')
      .addStringOption((o) =>
        o.setName('state').setDescription('on or off').setRequired(true).addChoices({ name: 'on', value: 'on' }, { name: 'off', value: 'off' })
      )
  )
  .addSubcommand((s) =>
    s.setName('antimention')
      .setDescription('Toggle anti mass-mention')
      .addStringOption((o) =>
        o.setName('state').setDescription('on or off').setRequired(true).addChoices({ name: 'on', value: 'on' }, { name: 'off', value: 'off' })
      )
  )
  .addSubcommand((s) =>
    s.setName('antilink')
      .setDescription('Delete links posted by members')
      .addStringOption((o) =>
        o.setName('state').setDescription('on or off').setRequired(true).addChoices({ name: 'on', value: 'on' }, { name: 'off', value: 'off' })
      )
  )
  .addSubcommand((s) =>
    s.setName('antiinvite')
      .setDescription('Delete Discord server invites')
      .addStringOption((o) =>
        o.setName('state').setDescription('on or off').setRequired(true).addChoices({ name: 'on', value: 'on' }, { name: 'off', value: 'off' })
      )
  )
  .addSubcommand((s) =>
    s.setName('antibadwords')
      .setDescription('Delete messages with abusive language')
      .addStringOption((o) =>
        o.setName('state').setDescription('on or off').setRequired(true).addChoices({ name: 'on', value: 'on' }, { name: 'off', value: 'off' })
      )
  )
  .addSubcommand((s) =>
    s.setName('anticaps')
      .setDescription('Delete excessive CAPS spam')
      .addStringOption((o) =>
        o.setName('state').setDescription('on or off').setRequired(true).addChoices({ name: 'on', value: 'on' }, { name: 'off', value: 'off' })
      )
  )
  .addSubcommand((s) =>
    s.setName('antinuke')
      .setDescription('Ban anyone mass-deleting channels/roles')
      .addStringOption((o) =>
        o.setName('state').setDescription('on or off').setRequired(true).addChoices({ name: 'on', value: 'on' }, { name: 'off', value: 'off' })
      )
  )
  .addSubcommand((s) =>
    s.setName('nukewhitelist')
      .setDescription('Trust a user so anti-nuke ignores them')
      .addUserOption((o) => o.setName('user').setDescription('User to whitelist').setRequired(true))
  );

export async function execute(interaction) {
  const sub = interaction.options.getSubcommand();

  if (sub === 'view') {
    const cfg = getGuildConfig(interaction.guild.id);
    const embed = new EmbedBuilder()
      .setColor(Colors.Blurple)
      .setTitle('⚙️ MC-Security Settings')
      .addFields(
        { name: 'Mod-log channel', value: cfg.modlog ? `<#${cfg.modlog}>` : '❌ not set', inline: true },
        { name: 'Anti-spam', value: cfg.antispam ? '✅ on' : '❌ off', inline: true },
        { name: 'Anti mass-mention', value: cfg.antimention ? '✅ on' : '❌ off', inline: true },
        { name: 'Spam threshold', value: `${cfg.antispamThreshold} msgs / ${cfg.antispamWindow / 1000}s`, inline: true },
        { name: 'Auto-timeout', value: `${cfg.antispamTimeout / 1000}s`, inline: true },
        { name: 'Max mentions / msg', value: `${cfg.maxMentions}`, inline: true }
      );
    await interaction.reply({ embeds: [embed], ephemeral: true });
    return;
  }

  if (sub === 'nukewhitelist') {
    const user = interaction.options.getUser('user');
    const cfg = getGuildConfig(interaction.guild.id);
    const list = cfg.nukeWhitelist ?? [];
    const has = list.includes(user.id);
    setGuildConfig(interaction.guild.id, {
      nukeWhitelist: has ? list.filter((id) => id !== user.id) : [...list, user.id],
    });
    const embed = new EmbedBuilder()
      .setColor(Colors.Green)
      .setDescription(has ? `➖ ${user} removed from anti-nuke whitelist.` : `➕ ${user} added to anti-nuke whitelist (trusted).`);
    await interaction.reply({ embeds: [embed], ephemeral: true });
    return;
  }

  const state = interaction.options.getString('state') === 'on';
  setGuildConfig(interaction.guild.id, { [sub]: state });

  const embed = new EmbedBuilder()
    .setColor(Colors.Green)
    .setDescription(`✅ **${sub.replace('anti', 'Anti-')}** is now **${state ? 'ON' : 'OFF'}**.`);
  await interaction.reply({ embeds: [embed], ephemeral: true });
}
