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
		name: "belowgpu",
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
			{ fields: { Graphics: "Below NVIDIA GeForce GTX 1660 Ti 6GB" } }
		);

		const processorButton1 = new ButtonBuilder()
			.setCustomId("aboveprocessor")
			.setLabel("Above Intel Core i7-8700K/AMD Ryzen 5 3600")
			.setStyle(ButtonStyle.Success);

		const processorButton2 = new ButtonBuilder()
			.setCustomId("belowprocessor")
			.setLabel("Below Intel Core i7-8700K/AMD Ryzen 5 3600")
			.setStyle(ButtonStyle.Danger);

		const row = new ActionRowBuilder().addComponents(
			processorButton1,
			processorButton2
		);

		if (success)
			return await interaction.followUp({
				content: "Please choose your processor:",
				components: [row],
				ephemeral: true,
			});
		else
			return await interaction.followUp({
				content: "An error has occured. Please try again later.",
				ephemeral: true,
			});
	},
};
