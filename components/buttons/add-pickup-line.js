const {
	StringSelectMenuBuilder,
	StringSelectMenuOptionBuilder,
	ComponentType,
	ActionRowBuilder,
	ModalBuilder,
	TextInputBuilder,
	TextInputStyle,
	bold,
	inlineCode,
	codeBlock,
	userMention,
	MessageFlags,
	messageLink,
} = require("discord.js");
require("dotenv").config();

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

		const modal = new ModalBuilder().setCustomId("pickup-line-modal");

		const modalRow = new ActionRowBuilder().addComponents(
			new TextInputBuilder()
				.setCustomId("line")
				.setLabel("Pick-up Line")
				.setStyle(TextInputStyle.Short)
				.setPlaceholder(
					"Example - Camille: Is your HP low? Cause you make my heart rate spike"
				)
		);

		modal.addComponents(modalRow);

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
			modal.setTitle(character);

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
				content: bold(modal.data.title),
				flags: MessageFlags.Ephemeral,
			});

			await modalReply.deleteReply();

			const pickupMessage = await sendPickupVote(
				modalReply,
				modal.data.title,
				channel
			);

			await interaction.editReply({
				content:
					"Your pick-up line has been submitted. It should be visible in " +
					messageLink(pickupMessage.channel.id, pickupMessage.id) +
					" shortly.\n\n" +
					bold(modal.data.title) +
					"\n" +
					codeBlock(
						modalReply.fields.getTextInputValue("line").length <
							2000
							? modalReply.fields.getTextInputValue("line")
							: modalReply.fields
									.getTextInputValue("line")
									.slice(0, 1000) + "..."
					),
			});

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

async function sendPickupVote(interaction, character, channel) {
	const user = interaction.user;
	const line = interaction.fields.getTextInputValue("line");

	const availableTags = channel.availableTags;
	let tagId;

	for (const tag of availableTags) {
		if (tag.name == character) {
			tagId = tag.id;
		}
	}

	const thread = channel.threads.create({
		name: user.username + "'s Pick-up Line",
		message: { content: line },
		appliedTags: [tagId],
	});
	return thread;
}
