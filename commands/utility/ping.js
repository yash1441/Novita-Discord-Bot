const { SlashCommandBuilder, MessageFlags } = require("discord.js");

module.exports = {
    cooldown: 5,
    category: "utility",
    data: new SlashCommandBuilder()
        .setName("ping")
        .setDescription("Replies with Pong!"),
    async execute(interaction) {
        await interaction.deferReply({
            flags: MessageFlags.Ephemeral,
        });

        const reply = await interaction.fetchReply();

        await interaction.editReply({
            content:
                "API Latency: " +
                interaction.client.ws.ping +
                "ms\nClient Ping: " +
                (
                    reply.interaction.createdTimestamp -
                    interaction.createdTimestamp
                ).toString() +
                "ms",
        });
    },
};
