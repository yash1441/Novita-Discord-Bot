const {
	MessageFlags,
	ActionRowBuilder,
	StringSelectMenuBuilder,
	ComponentType,
} = require("discord.js");
const fs = require("fs");
const path = require("path");
const lark = require("../../utils/lark.js");
require("dotenv").config();

const utils = path.join(__dirname, "../../utils");
const characters = JSON.parse(
	fs.readFileSync(path.join(utils, "characters.json"))
);

module.exports = {
	cooldown: 10,
	data: {
		name: "start-dating",
	},
	async execute(interaction) {
		await interaction.deferReply({ flags: MessageFlags.Ephemeral });

		const questions = [
			{
				customId: "question1",
				placeholder: "Select an option for Question 1",
				options: ["A", "B", "C"],
			},
			{
				customId: "question2",
				placeholder: "Select an option for Question 2",
				options: ["A", "B", "C"],
			},
			{
				customId: "question3",
				placeholder: "Select an option for Question 3",
				options: ["A", "B", "C"],
			},
		];

		const responses = {};

		for (const question of questions) {
			const selectMenu = new StringSelectMenuBuilder()
				.setCustomId(question.customId)
				.setPlaceholder(question.placeholder)
				.addOptions(
					question.options.map((option) => ({
						label: option,
						value: option,
					}))
				);

			const row = new ActionRowBuilder().addComponents(selectMenu);

			await interaction.editReply({
				content: question.placeholder,
				components: [row],
			});

			const filter = (i) =>
				i.user.id === interaction.user.id &&
				i.customId === question.customId;
			const collected = await interaction.channel.awaitMessageComponent({
				filter,
				componentType: ComponentType.StringSelect,
				time: 60000,
			});

			responses[question.customId] = collected.values[0];

			await collected.update({
				content: `You selected: ${collected.values[0]}`,
				components: [],
			});
		}

		await interaction.followUp({
			content: `You selected:\nQuestion 1: ${responses.question1}\nQuestion 2: ${responses.question2}\nQuestion 3: ${responses.question3}`,
			flags: MessageFlags.Ephemeral,
		});
	},
};
