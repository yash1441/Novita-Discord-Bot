const { bold } = require("discord.js");
const lark = require("../../utils/lark");
require("dotenv").config();

module.exports = {
	cooldown: 10,
	data: {
		name: "belowprocessor",
	},
	async execute(interaction) {
		const discordId = interaction.user.id;
		const response = await lark.listRecords(
			process.env.FEEDBACK_POOL_BASE,
			process.env.CODES_TABLE,
			{ filter: 'CurrentValue.[Discord ID] = "' + discordId + '"' }
		);

		if (!response || !response.total)
			return await interaction.update({
				content:
					"You aren't registered. Please use the " +
					bold("Register") +
					" button to register.",
			});

		const success = await lark.updateRecord(
			process.env.FEEDBACK_POOL_BASE,
			process.env.CODES_TABLE,
			response.items[0].recordId,
			{
				fields: {
					Processor: "Below Intel Core i7-8700K/AMD Ryzen 5 3600",
				},
			}
		);

		if (success)
			await interaction.update({
				content:
					"You have been registered! Please use the " +
					bold("Get Code") +
					" button once the code distribution has started to get your code.",
			});
		else
			return await interaction.update({
				content: "An error has occured. Please try again later.",
			});
	},
};
