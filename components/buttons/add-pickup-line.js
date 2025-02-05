const {
	StringSelectMenuBuilder,
	StringSelectMenuOptionBuilder,
	ComponentType,
	ActionRowBuilder,
	ModalBuilder,
	TextInputBuilder,
	TextInputStyle,
	EmbedBuilder,
	bold,
	inlineCode,
	codeBlock,
	userMention,
	MessageFlags,
	messageLink,
} = require("discord.js");
const fs = require("fs");
const path = require("path");
const lark = require("../../utils/lark.js");
const { send } = require("process");
require("dotenv").config();

const utils = path.join(__dirname, "../../utils");
const characters = JSON.parse(
	fs.readFileSync(path.join(utils, "characters.json"))
);

module.exports = {
	cooldown: 10,
	data: {
		name: "add-pickup-line",
	},
	async execute(interaction) {
		await interaction.deferReply({ flags: MessageFlags.Ephemeral });

		const channel = await interaction.client.channels.fetch(
			process.env.VOTE_LINE_ID
		);
		const availableTags = channel.availableTags;

		const data = {
			interaction: interaction,
			channel: channel,
			tags: availableTags,
		};

		const selectMenu = new StringSelectMenuBuilder()
			.setCustomId("pickup-line-character")
			.setPlaceholder("Select a character");

		for (const tag of availableTags) {
			selectMenu.addOptions(
				new StringSelectMenuOptionBuilder()
					.setLabel(tag.name)
					.setValue(tag.name)
			);
		}

		const row = new ActionRowBuilder().addComponents(selectMenu);

		const modal = new ModalBuilder()
			.setTitle("Deadly Pick-up Lines")
			.setCustomId("pickup-line-modal");

		const modalRow1 = new ActionRowBuilder().addComponents(
			new TextInputBuilder()
				.setCustomId("title")
				.setLabel("Title")
				.setStyle(TextInputStyle.Short)
				.setPlaceholder("Give your pick-up line a title")
		);

		const modalRow2 = new ActionRowBuilder().addComponents(
			new TextInputBuilder()
				.setCustomId("line")
				.setLabel("Pick-up Line")
				.setStyle(TextInputStyle.Paragraph)
				.setPlaceholder(
					"Example - Camille: Is your HP low? Cause you make my heart rate spike"
				)
		);

		modal.addComponents(modalRow1, modalRow2);

		await interaction.editReply({
			content: "**Who are you trying to talk to?**",
			components: [row],
		});

		const botReply = await interaction.fetchReply();

		const collector = botReply.createMessageComponentCollector({
			time: 20_000,
			componentType: ComponentType.StringSelect,
		});

		collector.on("collect", async (selectMenuInteraction) => {
			const character = selectMenuInteraction.values[0];
			data.character = {
				name: character,
				thumbnail: characters[character].thumbnail,
			};

			await interaction.editReply({
				content:
					userMention(selectMenuInteraction.user.id) +
					" has selected " +
					inlineCode(character),
				components: [],
			});

			await selectMenuInteraction.showModal(modal);

			const modalReply = await selectMenuInteraction
				.awaitModalSubmit({
					time: 60_000,
					filter: (modalInteraction) =>
						modalInteraction.user.id ===
						selectMenuInteraction.user.id,
				})
				.catch(() => {
					interaction.editReply({
						content: "The form has expired.",
						components: [],
					});
					setTimeout(() => interaction.deleteReply(), 10_000);
					return null;
				});

			if (!modalReply) return;

			await modalReply.reply({
				content: bold(data.character.name),
				flags: MessageFlags.Ephemeral,
			});

			await modalReply.deleteReply();

			data.modal = modalReply;

			await sendPickupVote(data);

			collector.stop();
		});

		collector.on("end", (collected, reason) => {
			if (reason === "time" && !collected.size) {
				interaction.editReply({
					content: "The selection has expired.",
					components: [],
				});
				setTimeout(() => interaction.deleteReply(), 10_000);
			}
		});
	},
};

async function sendPickupVote(data) {
	const user = data.modal.user;
	const title = data.modal.fields.getTextInputValue("title");
	const line = data.modal.fields.getTextInputValue("line");

	for (const tag of data.tags) {
		if (tag.name == data.character.name) {
			data.character.id = tag.id;
		}
	}

	const embed = new EmbedBuilder()
		.setAuthor({
			name: user.username,
			iconURL: user.displayAvatarURL(),
		})
		.setDescription(codeBlock(line))
		.setColor(process.env.EMBED_COLOR)
		.setFooter({ text: user.id })
		.setThumbnail(data.character.thumbnail);

	const thread = await data.channel.threads.create({
		name: title,
		reason: "Submitted by " + user.username,
		message: { embeds: [embed] },
		appliedTags: [data.character.id],
	});

	const message = await thread.fetchStarterMessage();
	await message.react("❤️").then(() => message.react("💔"));

	await data.interaction.editReply({
		content:
			"Your pick-up line has been submitted. It should be visible in " +
			messageLink(message.channel.id, message.id) +
			" shortly.\n\n",
	});

	await lark.createRecord(
		process.env.COMMUNITY_POOL_BASE,
		process.env.LINE_TABLE,
		{
			fields: {
				"Discord ID": user.id,
				"Discord Username": user.username,
				Character: data.character.name,
				Title: title,
				Line: line,
				Thread: {
					link: messageLink(message.channel.id, message.id),
					text: "View",
				},
			},
		}
	);

	return message;
}
