const {
    SlashCommandBuilder,
    PermissionFlagsBits,
    MessageFlags,
} = require("discord.js");
const cronjobs = require("../../cronjobs");

module.exports = {
    category: "management",
    data: new SlashCommandBuilder()
        .setName("rewards")
        .setDescription("Simulate reward delivery system")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction) {
        await interaction.reply({
            content: "Started reward delivery system...",
            flags: MessageFlags.Ephemeral,
        });

        cronjobs(interaction.client);
    },
};
