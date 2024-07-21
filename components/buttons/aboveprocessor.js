const { bold } = require("discord.js");
const lark = require("../../utils/lark");
require("dotenv").config();

module.exports = {
	cooldown: 10,
	data: {
		name: "aboveprocessor",
	},
	async execute(interaction) {
		await interaction.update({ content: "Please wait...", components: [] });
		const discordId = interaction.user.id;
		const response = await lark.listRecords(
			process.env.FEEDBACK_POOL_BASE,
			process.env.CODES_TABLE,
			{ filter: 'CurrentValue.[Discord ID] = "' + discordId + '"' }
		);

		if (!response || !response.total)
			return await interaction.followUp({
				content:
					"You aren't registered. Please use the " +
					bold("Register") +
					" button to register.",
				ephemeral: true,
			});

		const success = await lark.updateRecord(
			process.env.FEEDBACK_POOL_BASE,
			process.env.CODES_TABLE,
			response.items[0].record_id,
			{
				fields: {
					Processor: "Above Intel Core i7-8700K/AMD Ryzen 5 3600",
				},
			}
		);

		if (success)
			await interaction.followUp({
				content:
					"You have been registered! Please use the " +
					bold("Get Code") +
					" button once the code distribution has started to get your code.",
				ephemeral: true,
			});
		else
			return await interaction.followUp({
				content: "An error has occured. Please try again later.",
				ephemeral: true,
			});
	},
};
