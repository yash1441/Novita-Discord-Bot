const { codeBlock, EmbedBuilder, MessageFlags } = require("discord.js");
require("dotenv").config();

module.exports = {
    cooldown: 10,
    data: {
        name: "discord-id",
    },
    async execute(interaction) {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        const discordId = interaction.user.id;

        const embed = new EmbedBuilder()
            .setColor(process.env.EMBED_COLOR)
            .setTitle("Your Discord ID")
            .setDescription(codeBlock(discordId))
            .setTimestamp();

        await interaction.editReply({ embeds: [embed] });
    },
};
