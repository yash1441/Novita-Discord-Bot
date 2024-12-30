const { bold } = require("discord.js");
require("dotenv").config();

module.exports = {
	data: {
		name: "region-select",
	},
	async execute(interaction) {
		const region = interaction.values[0];

		await interaction.update({
			content: "Region selected!" + "\n" + bold(region),
		});

		const discordId = interaction.user.id;
	},
};
