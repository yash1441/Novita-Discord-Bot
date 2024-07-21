const {
	bold,
	ButtonBuilder,
	ButtonStyle,
	ActionRowBuilder,
} = require("discord.js");
const lark = require("../../utils/lark");
require("dotenv").config();

module.exports = {
	cooldown: 10,
	data: {
		name: "abovegpu",
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
			{ fields: { Graphics: "Above NVIDIA GeForce GTX 1660 Ti 6GB" } }
		);

		const processorButton1 = new ButtonBuilder()
			.setCustomId("above1660ti")
			.setLabel("Above Intel Core i7-8700K/AMD Ryzen 5 3600")
			.setStyle(ButtonStyle.Success);

		const processorButton2 = new ButtonBuilder()
			.setCustomId("below1660ti")
			.setLabel("Below Intel Core i7-8700K/AMD Ryzen 5 3600")
			.setStyle(ButtonStyle.Danger);

		const row = new ActionRowBuilder().addComponents(
			processorButton1,
			processorButton2
		);

		if (success)
			return await interaction.update({
				content: "Please choose your processor:",
				components: [row],
			});
		else
			return await interaction.update({
				content: "An error has occured. Please try again later.",
			});
	},
};
