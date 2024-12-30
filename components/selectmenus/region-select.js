const {} = require("discord.js");
require("dotenv").config();

module.exports = {
	data: {
		name: "region-select",
	},
	async execute(interaction) {
		await interaction.deferReply({ ephemeral: true });

		const discordId = interaction.user.id;

		await interaction.editReply({ content: "Region selected!" });
	},
};
