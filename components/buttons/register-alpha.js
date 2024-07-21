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
					" button once the code distribution has started to get your code.",
			});

		const gpuButton1 = new ButtonBuilder()
			.setCustomId("abovegpu")
			.setLabel("Above NVIDIA GeForce GTX 1660 Ti 6GB")
			.setStyle(ButtonStyle.Success);

		const gpuButton2 = new ButtonBuilder()
			.setCustomId("belowgpu")
			.setLabel("Below NVIDIA GeForce GTX 1660 Ti 6GB")
			.setStyle(ButtonStyle.Danger);

		const row = new ActionRowBuilder().addComponents(
			gpuButton1,
			gpuButton2
		);

		const success = await lark.createRecord(
			process.env.FEEDBACK_POOL_BASE,
			process.env.CODES_TABLE,
			{ fields: { "Discord ID": discordId } }
		);

		if (success)
			return await interaction.editReply({
				content: "Please choose your graphics:",
				components: [row],
			});
		else
			return await interaction.editReply({
				content: "An error has occured. Please try again later.",
			});
	},
};
