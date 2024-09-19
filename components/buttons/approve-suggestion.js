const { EmbedBuilder, userMention, hyperlink, bold } = require('discord.js');
require('dotenv').config();

module.exports = {
    data: {
        name: 'approve-suggestion',
    },
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        const embed = interaction.message.embeds[0];

        const approvedEmbed = EmbedBuilder.from(embed).setColor(process.env.EMBED_COLOR_APPROVED).addFields({ name: 'Decision', value: userMention(interaction.user.id), inline: true });

        const message = await sendSuggestionVote(interaction, approvedEmbed);

        approvedEmbed.addFields({ name: '\u200B', value: hyperlink(bold('Vote'), message.url), inline: false });

        await interaction.message.edit({ embeds: [approvedEmbed], components: [] }).then(() => interaction.deleteReply());
    },
};

async function sendSuggestionVote(interaction, embedData) {
    const channel = (interaction.guildId === process.env.GUILD_ID) ? await interaction.client.channels.fetch(process.env.VOTE_SUGGESTION_ID) : await interaction.client.channels.fetch(process.env.VOTE_SUGGESTION_ID_JP);
    const availableTags = channel.availableTags;
    let tagId;

    for (const tag of availableTags) {
        if (tag.name == embedData.data.fields[0].value) {
            tagId = tag.id;
        }
    }

    const embed = new EmbedBuilder()
        .setAuthor({ name: embedData.data.author.name, iconURL: embedData.data.author.icon_url })
        .setDescription(embedData.data.description)
        .setColor(process.env.EMBED_COLOR)
        .setFooter({ text: embedData.data.footer.text });

    const thread = channel.threads.create({ name: embedData.data.title, reason: 'Approved by ' + interaction.user.username, message: { embeds: [embed] }, appliedTags: [tagId] });
    return thread;
}