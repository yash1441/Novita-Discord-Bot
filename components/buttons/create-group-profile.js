const {
	MessageFlags,
	ModalBuilder,
	TextInputBuilder,
	TextInputStyle,
	EmbedBuilder,
	StringSelectMenuBuilder,
	StringSelectMenuOptionBuilder,
	ActionRowBuilder,
	ComponentType,
	bold,
	inlineCode,
	userMention,
} = require("discord.js");
const lark = require("../../utils/lark");
require("dotenv").config();

module.exports = {
	cooldown: 10,
	data: {
		name: "create-group-profile",
	},
	async execute(interaction) {
		await interaction.deferReply({ flags: MessageFlags.Ephemeral });
		const data = {
			interaction: interaction,
			discordId: interaction.user.id,
			serverId: interaction.guildId,
		};
		data.forumChannel = await interaction.client.channels.fetch(
			data.serverId === process.env.GUILD_ID
				? process.env.LFG_CHANNEL
				: process.env.LFG_CHANNEL_JP
		);
		data.tags = data.forumChannel.availableTags;
		data.region = "JP";

		const selectMenuRow = generateSelectMenu(data);
		const modal = generateModal(data.serverId);

		if (data.serverId === process.env.GUILD_ID)
			await showSelectMenu(interaction, selectMenuRow, modal);

		// const response = await lark.listRecords(
		// 	process.env.COMMUNITY_POOL_BASE,
		// 	process.env.LFG_TABLE
		// );
	},
};

function generateSelectMenu(data) {
	const selectMenu = new StringSelectMenuBuilder()
		.setCustomId("lfg-region-select")
		.setPlaceholder("Which Region Do You Play From?");

	for (const tag of data.tags) {
		selectMenu.addOptions(
			new StringSelectMenuOptionBuilder().setLabel(tag.name).setValue(tag.name)
		);
	}
	const row = new ActionRowBuilder().addComponents(selectMenu);
	return row;
}

function generateModal(serverId) {
	const modal = new ModalBuilder()
		.setCustomId("create-group-profile-modal")
		.setTitle(
			serverId === process.env.GUILD_ID
				? "Looking for Teammates"
				: "チームメンバー募集"
		);

	const gameModeInput = new TextInputBuilder()
		.setCustomId("game-mode-input")
		.setLabel(
			serverId === process.env.GUILD_ID
				? "Which Game Mode Do You Want to Play?"
				: "希望ゲームモード:"
		)
		.setStyle(TextInputStyle.Short)
		.setRequired(true);

	const teamDescriptionInput = new TextInputBuilder()
		.setCustomId("team-description-input")
		.setLabel(
			serverId === process.env.GUILD_ID
				? "General Description About the Team"
				: "募集条件:"
		)
		.setStyle(TextInputStyle.Paragraph)
		.setRequired(true);

	const languageInput = new TextInputBuilder()
		.setCustomId("language-input")
		.setLabel(
			serverId === process.env.GUILD_ID
				? "What Language Do You Prefer?"
				: "ボイスチャットの可否:"
		)
		.setStyle(TextInputStyle.Short)
		.setRequired(true);

	const timeInput = new TextInputBuilder()
		.setCustomId("time-input")
		.setLabel(
			serverId === process.env.GUILD_ID
				? "Expected Online Times:"
				: "プレイできる時間帯:"
		)
		.setStyle(TextInputStyle.Short)
		.setRequired(true);

	const firstActionRow = new ActionRowBuilder().addComponents(gameModeInput);
	const secondActionRow = new ActionRowBuilder().addComponents(
		teamDescriptionInput
	);
	const thirdActionRow = new ActionRowBuilder().addComponents(languageInput);
	const fourthActionRow = new ActionRowBuilder().addComponents(timeInput);

	modal.addComponents(
		firstActionRow,
		secondActionRow,
		thirdActionRow,
		fourthActionRow
	);

	return modal;
}

async function showSelectMenu(interaction, selectMenuRow, modal) {
	await interaction.editReply({
		content: "Region Selection",
		components: [selectMenuRow],
	});

	const botReply = await interaction.fetchReply();

	const collector = botReply.createMessageComponentCollector({
		time: 20_000,
		componentType: ComponentType.StringSelect,
	});

	collector.on("collect", async (selectMenuInteraction) => {
		data.region = selectMenuInteraction.values[0];

		await interaction.editReply({
			content:
				userMention(selectMenuInteraction.user.id) +
				" has selected " +
				inlineCode(data.region),
			components: [],
		});

		await selectMenuInteraction.showModal(modal);

		const modalReply = await selectMenuInteraction
			.awaitModalSubmit({
				time: 60_000,
				filter: (modalInteraction) =>
					modalInteraction.user.id === selectMenuInteraction.user.id,
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

		await sendLFGData(data);

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
}

async function sendLFGData(data) {
	const embed = new EmbedBuilder()
		.setTitle(
			data.serverId === process.env.GUILD_ID
				? "Looking for Teammates"
				: "チームメンバー募集"
		)
		.setDescription(
			bold(data.serverId === process.env.GUILD_ID ? "User:" : "ユーザーID:") +
				"\n" +
				inlineCode(data.discordId) +
				" (" +
				data.modal.user.username +
				")"
		)
		.setColor(process.env.EMBED_COLOR);

	if (data.serverId === process.env.GUILD_ID) {
		embed.addFields(
			{
				name: "Region:",
				value: data.region,
				inline: false,
			},
			{
				name: "Game Mode:",
				value: data.modal.fields.getTextInputValue("game-mode-input"),
				inline: false,
			},
			{
				name: "Team Description:",
				value: data.modal.fields.getTextInputValue("team-description-input"),
				inline: false,
			},
			{
				name: "Language:",
				value: data.modal.fields.getTextInputValue("language-input"),
				inline: false,
			},
			{
				name: "Expected Online Times:",
				value: data.modal.fields.getTextInputValue("time-input"),
				inline: false,
			}
		);
	} else {
		embed.addFields(
			{
				name: "希望ゲームモード:",
				value: data.modal.fields.getTextInputValue("game-mode-input"),
				inline: false,
			},
			{
				name: "募集条件:",
				value: data.modal.fields.getTextInputValue("team-description-input"),
				inline: false,
			},
			{
				name: "ボイスチャットの可否:",
				value: data.modal.fields.getTextInputValue("language-input"),
				inline: false,
			},
			{
				name: "プレイできる時間帯:",
				value: data.modal.fields.getTextInputValue("time-input"),
				inline: false,
			}
		);
	}

	for (const tag of data.tags) {
		if (tag.name == data.region) {
			data.region.id = tag.id;
		}
	}

	const thread = await data.channel.threads.create({
		name: title,
		reason: "Submitted by " + data.modal.user.username,
		message: { embeds: [embed] },
		appliedTags: [data.region.id],
	});

	const message = await thread.fetchStarterMessage();
}
