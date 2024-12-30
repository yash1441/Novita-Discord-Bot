const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
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
			ephemeral: true,
		});

		cronjobs(interaction.client);
	},
};
