const { bold } = require("discord.js");
const lark = require("../../utils/lark");
require("dotenv").config();

module.exports = {
	cooldown: 10,
	data: {
		name: "register-alpha",
	},
	async execute(interaction) {
		await interaction.deferReply({ ephemeral: true });
		const discordId = interaction.user.id;

		const response = await lark.listRecords(
			process.env.FEEDBACK_POOL_BASE,
			process.env.CODES_TABLE,
			{ filter: 'CurrentValue.[Discord ID] = "' + discordId + '"' }
		);

		if (!response)
			return await interaction.editReply({
				content: "An error has occured. Please try again later.",
			});

		if (response.total)
			return await interaction.editReply({
				content:
					"You are already registered! Please use the " +
					bold("Get Code") +
					"button once the code distribution has started to get your code.",
			});

		const success = await lark.createRecord(
			process.env.FEEDBACK_POOL_BASE,
			process.env.CODES_TABLE,
			{ fields: { "Discord ID": discordId } }
		);

		if (success)
			return await interaction.editReply({
				content:
					"You have been registered! Please use the " +
					bold("Get Code") +
					"button once the code distribution has started to get your code.",
			});
		else
			return await interaction.editReply({
				content: "An error has occured. Please try again later.",
			});
	},
};
