const {
	bold,
	ButtonBuilder,
	ButtonStyle,
	ComponentType,
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
		const userInfo = {
			discordId: interaction.user.id,
		};

		const response = await lark.listRecords(
			process.env.FEEDBACK_POOL_BASE,
			process.env.CODES_TABLE,
			{
				filter:
					'CurrentValue.[Discord ID] = "' + userInfo.discordId + '"',
			}
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

		const row1 = new ActionRowBuilder().addComponents(
			gpuButton1,
			gpuButton2
		);

		const processorButton1 = new ButtonBuilder()
			.setCustomId("aboveprocessor")
			.setLabel("Above Intel Core i7-8700K/AMD Ryzen 5 3600")
			.setStyle(ButtonStyle.Success);

		const processorButton2 = new ButtonBuilder()
			.setCustomId("belowprocessor")
			.setLabel("Below Intel Core i7-8700K/AMD Ryzen 5 3600")
			.setStyle(ButtonStyle.Danger);

		const row2 = new ActionRowBuilder().addComponents(
			processorButton1,
			processorButton2
		);

		await interaction.editReply({
			content: "Please select your GPU:",
			components: [row1],
		});

		const collector = message.createMessageComponentCollector({
			componentType: ComponentType.Button,
			time: 60_000,
		});

		collector.on("collect", (i) => {
			if (i.user.id === interaction.user.id) {
				if (i.customId === "abovegpu") {
					userInfo.gpu = "Above NVIDIA GeForce GTX 1660 Ti 6GB";
					interaction.editReply({
						content: "Please select your processor:",
						components: [row2],
					});
				} else if (i.customId === "belowgpu") {
					userInfo.gpu = "Below NVIDIA GeForce GTX 1660 Ti 6GB";
					interaction.editReply({
						content: "Please select your processor:",
						components: [row2],
					});
				} else if (i.customId === "aboveprocessor") {
					userInfo.processor =
						"Above Intel Core i7-8700K/AMD Ryzen 5 3600";
					sendDataToLark(interaction, userInfo);
					collector.stop();
				} else if (i.customId === "belowprocessor") {
					userInfo.processor =
						"Below Intel Core i7-8700K/AMD Ryzen 5 3600";
					sendDataToLark(interaction, userInfo);
					collector.stop();
				}
			}
		});

		collector.on("end", (collected) => {
			console.log(`Collected ${collected.size} interactions.`);
		});
	},
};

async function sendDataToLark(interaction, userInfo) {
	const success = await lark.createRecord(
		process.env.FEEDBACK_POOL_BASE,
		process.env.CODES_TABLE,
		{
			fields: {
				"Discord ID": userInfo.discordId,
				Graphics: userInfo.gpu,
				Processor: userInfo.processor,
			},
		}
	);

	if (success)
		return await interaction.editReply({
			content:
				"You have been registered! Please use the " +
				bold("Get Code") +
				" button once the code distribution has started to get your code.",
		});
	else
		return await interaction.editReply({
			content: "An error has occured. Please try again later.",
		});
}
