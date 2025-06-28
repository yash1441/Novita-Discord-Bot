const {
	ModalBuilder,
	TextInputBuilder,
	ActionRowBuilder,
	TextInputStyle,
	MessageFlags,
} = require("discord.js");
const lark = require("../../utils/lark");
require("dotenv").config();

module.exports = {
	data: {
		name: "lfg-gameplay-mode",
	},
	async execute(interaction) {
		const gameplayMode = interaction.values[0];
		const discordId = interaction.user.id;
		const serverId = interaction.guildId;

		const modal = new ModalBuilder()
			.setCustomId("create-group-profile-modal")
			.setTitle(
				serverId === process.env.GUILD_ID
					? "Looking for Teammates"
					: "チームメンバー募集"
			);

		const regionInput = new TextInputBuilder()
			.setCustomId("region-input")
			.setLabel("Which Region Do You Play From?")
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

		const firstActionRow = new ActionRowBuilder().addComponents(regionInput);
		const secondActionRow = new ActionRowBuilder().addComponents(
			teamDescriptionInput
		);
		const thirdActionRow = new ActionRowBuilder().addComponents(languageInput);
		const fourthActionRow = new ActionRowBuilder().addComponents(timeInput);

		const actionRows = [];

		if (serverId === process.env.GUILD_ID) {
			actionRows.push(firstActionRow);
		}
		actionRows.push(secondActionRow, thirdActionRow, fourthActionRow);

		modal.addComponents(...actionRows);

		await interaction.showModal(modal);

		const modalReply = await interaction
			.awaitModalSubmit({
				time: 60_000,
				filter: (modalInteraction) => modalInteraction.user.id === discordId,
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
			content: "Your form has been submitted!",
			flags: MessageFlags.Ephemeral,
		});

		await modalReply.deleteReply();
		const data = {
			discordId: discordId,
			serverId: serverId,
			gameplayMode: gameplayMode,
			region: modalReply.fields.getTextInputValue("region-input"),
			teamDescription: modalReply.fields.getTextInputValue(
				"team-description-input"
			),
			language: modalReply.fields.getTextInputValue("language-input"),
			time: modalReply.fields.getTextInputValue("time-input"),
		};

		await modalReply.editReply({
			content: `**Gameplay Mode:** ${data.gameplayMode}\n**Region:** ${data.region}\n**Team Description:** ${data.teamDescription}\n**Language:** ${data.language}\n**Time:** ${data.time}`,
			components: [],
		});
	},
};
