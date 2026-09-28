import {
  SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, Colors,
} from 'discord.js';

const EMOJIS = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];

export const data = new SlashCommandBuilder()
  .setName('poll')
  .setDescription('Create a reaction poll')
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
  .addStringOption((o) => o.setName('question').setDescription('Poll question').setRequired(true));

for (let i = 1; i <= 10; i++) {
  data.addStringOption((o) =>
    o.setName(`option${i}`).setDescription(`Option ${i}${i > 2 ? '' : ' (required)'}`).setRequired(i <= 2)
  );
}

export async function execute(interaction) {
  const question = interaction.options.getString('question');
  const options = [];
  for (let i = 1; i <= 10; i++) {
    const v = interaction.options.getString(`option${i}`);
    if (v) options.push(v);
  }

  const embed = new EmbedBuilder()
    .setColor(Colors.Blurple)
    .setAuthor({ name: `📊 Poll by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
    .setTitle(question)
    .setDescription(options.map((o, i) => `${EMOJIS[i]}  ${o}`).join('\n\n'))
    .setFooter({ text: 'React to vote!' })
    .setTimestamp();

  const msg = await interaction.channel.send({ embeds: [embed] });
  for (let i = 0; i < options.length; i++) await msg.react(EMOJIS[i]);

  await interaction.reply({ content: '📊 Poll created!', ephemeral: true });
}
