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

		const flowers = Object.values(characters).map(
			(character) => character.flower.name
		);
		const chocolates = Object.values(characters).map(
			(character) => character.chocolate
		);
		const dates = Object.values(characters).map(
			(character) => character.date
		);

		const questions = [
			{
				customId: "chocolate",
				placeholder: "What's your favorite chocolate flavor?",
				options: chocolates,
			},
			{
				customId: "flower",
				placeholder: "Pick a flower:",
				options: flowers,
			},
			{
				customId: "date",
				placeholder: "Where's your dream date spot?",
				options: dates,
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
			content: `You selected:\nFlower: ${responses.chocolate}\nChocolate: ${responses.flower}\nDate Location: ${responses.date}`,
			flags: MessageFlags.Ephemeral,
		});
	},
};
