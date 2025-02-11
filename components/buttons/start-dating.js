const {
	MessageFlags,
	ActionRowBuilder,
	StringSelectMenuBuilder,
	ComponentType,
	EmbedBuilder,
	bold,
	userMention,
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
				customId: "flower",
				placeholder: "Pick a flower:",
				options: flowers,
			},
			{
				customId: "chocolate",
				placeholder: "What's your favorite chocolate flavor?",
				options: chocolates,
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

		// Calculate points for each character
		const characterPoints = {};
		for (const [name, character] of Object.entries(characters)) {
			characterPoints[name] = 0;
			if (character.flower.name === responses.flower)
				characterPoints[name]++;
			if (character.chocolate === responses.chocolate)
				characterPoints[name]++;
			if (character.date === responses.date) characterPoints[name]++;
		}

		// Determine the preferred character
		let preferredCharacter = null;
		let maxPoints = 0;
		for (const [name, points] of Object.entries(characterPoints)) {
			if (points > maxPoints) {
				maxPoints = points;
				preferredCharacter = name;
			} else if (points === maxPoints) {
				// Apply priority: flower > chocolate > date
				if (characters[name].flower.name === responses.flower) {
					preferredCharacter = name;
				} else if (
					characters[name].chocolate === responses.chocolate &&
					characters[preferredCharacter].flower.name !==
						responses.flower
				) {
					preferredCharacter = name;
				} else if (
					characters[name].date === responses.date &&
					characters[preferredCharacter].flower.name !==
						responses.flower &&
					characters[preferredCharacter].chocolate !==
						responses.chocolate
				) {
					preferredCharacter = name;
				}
			}
		}

		const embed = new EmbedBuilder()
			.setAuthor({
				name: interaction.user.username,
				iconURL: interaction.user.displayAvatarURL(),
			})
			.setTitle("Location: " + responses.date)
			.setDescription(bold("Partner: ") + preferredCharacter)
			.setColor(process.env.EMBED_COLOR)
			.setFooter({
				text: "This event is just for fun. Have an awesome day!",
			})
			.setThumbnail(characters[preferredCharacter].thumbnail);

		await interaction.followUp({
			content:
				userMention(interaction.user.id) +
				" Happy Ventine's Day! Your date setup:",
			embeds: [embed],
			flags: MessageFlags.Ephemeral,
		});
	},
};
