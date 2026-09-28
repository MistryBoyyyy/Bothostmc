import {
  SlashCommandBuilder, EmbedBuilder, Colors,
} from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('userinfo')
  .setDescription('Show information about a member')
  .addUserOption((o) => o.setName('user').setDescription('Member (default: you)'));

export async function execute(interaction) {
  const member = interaction.options.getMember('user') ?? interaction.member;

  const embed = new EmbedBuilder()
    .setColor(Colors.Blurple)
    .setThumbnail(member.displayAvatarURL())
    .setTitle(`User Info — ${member.user.tag}`)
    .addFields(
      { name: 'ID', value: `\`${member.id}\``, inline: true },
      { name: 'Bot?', value: member.user.bot ? 'Yes' : 'No', inline: true },
      { name: 'Account created', value: `<t:${Math.floor(member.user.createdTimestamp / 1000)}:R>`, inline: true },
      { name: 'Joined server', value: member.joinedTimestamp ? `<t:${Math.floor(member.joinedTimestamp / 1000)}:R>` : 'Unknown', inline: true },
      { name: 'Timed out?', value: member.isCommunicationDisabled() ? 'Yes' : 'No', inline: true },
      { name: `Roles (${member.roles.cache.size - 1})`, value: member.roles.cache.filter((r) => r.id !== interaction.guild.id).map((r) => r.toString()).join(' ') || 'None' }
    );

  await interaction.reply({ embeds: [embed] });
}
