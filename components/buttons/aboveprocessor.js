const { bold } = require("discord.js");
const lark = require("../../utils/lark");
require("dotenv").config();

module.exports = {
	cooldown: 10,
	data: {
		name: "aboveprocessor",
	},
	async execute(interaction) {
		await interaction.deferReply({ ephemeral: true });
		const discordId = interaction.user.id;

		const response = await lark.listRecords(
			process.env.FEEDBACK_POOL_BASE,
			process.env.CODES_TABLE,
			{ filter: 'CurrentValue.[Discord ID] = "' + discordId + '"' }
		);

		if (!response || !response.total)
			return await interaction.editReply({
				content:
					"You aren't registered. Please use the " +
					bold("Register") +
					" button to register.",
			});

		const success = await lark.updateRecord(
			process.env.FEEDBACK_POOL_BASE,
			process.env.CODES_TABLE,
			response.data.items[0].recordId,
			{
				fields: {
					Processor: "Above Intel Core i7-8700K/AMD Ryzen 5 3600",
				},
			}
		);

		if (success)
			await interaction.editReply({
				content:
					"You have been registered! Please use the " +
					bold("Get Code") +
					" button once the code distribution has started to get your code.",
			});
		else
			return await interaction.editReply({
				content: "An error has occured. Please try again later.",
			});
	},
};
