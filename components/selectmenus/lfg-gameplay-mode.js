const {
	ModalBuilder,
	TextInputBuilder,
	ActionRowBuilder,
	TextInputStyle,
	MessageFlags,
	messageLink,
	EmbedBuilder,
	inlineCode,
	codeBlock,
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
		const english = serverId === process.env.GUILD_ID ? true : false;
		const korean = serverId === process.env.GUILD_ID_KR ? true : false;
		const japanese = serverId === process.env.GUILD_ID_JP ? true : false;

		const modal = new ModalBuilder()
			.setCustomId("create-group-profile-modal")
			.setTitle(
				english
					? "Looking for Teammates"
					: korean
						? "팀원 모집"
						: "チームメンバー募集",
			);

		const regionInput = new TextInputBuilder()
			.setCustomId("region-input")
			.setLabel(korean ? "파티 소개" : "Which Region Do You Play From?")
			.setStyle(TextInputStyle.Short)
			.setRequired(true);

		const teamDescriptionInput = new TextInputBuilder()
			.setCustomId("team-description-input")
			.setLabel(
				english
					? "General Description About the Team"
					: korean
						? "파티 소개:"
						: "募集条件:",
			)
			.setStyle(TextInputStyle.Paragraph)
			.setRequired(true);

		const languageInput = new TextInputBuilder()
			.setCustomId("language-input")
			.setLabel(
				english
					? "What Language Do You Prefer?"
					: korean
						? "규칙 준수 및 바른 말 사용에 동의하시나요?"
						: "ボイスチャットの可否:",
			)
			.setStyle(TextInputStyle.Short)
			.setRequired(true);

		const timeInput = new TextInputBuilder()
			.setCustomId("time-input")
			.setLabel(
				english
					? "Expected Online Times:"
					: korean
						? "게임 시작 시간:"
						: "プレイできる時間帯:",
			)
			.setStyle(TextInputStyle.Short)
			.setRequired(true);

		const firstActionRow = new ActionRowBuilder().addComponents(regionInput);
		const secondActionRow = new ActionRowBuilder().addComponents(
			teamDescriptionInput,
		);
		const thirdActionRow = new ActionRowBuilder().addComponents(languageInput);
		const fourthActionRow = new ActionRowBuilder().addComponents(timeInput);

		const actionRows = [];

		serverId === process.env.GUILD_ID ? actionRows.push(firstActionRow) : null;

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

		const data = {
			discordId: discordId,
			serverId: serverId,
			gameplayMode: gameplayMode,
			teamDescription: modalReply.fields.getTextInputValue(
				"team-description-input",
			),
			language: modalReply.fields.getTextInputValue("language-input"),
			time: modalReply.fields.getTextInputValue("time-input"),
		};

		english
			? (data.region = modalReply.fields.getTextInputValue("region-input"))
			: korean
				? (data.region = "KR")
				: (data.region = "JP");

		const forumChannelId = english
			? process.env.LFG_CHANNEL
			: korean
				? process.env.LFG_CHANNEL_KR
				: process.env.LFG_CHANNEL_JP;

		const forumChannel =
			await interaction.client.channels.fetch(forumChannelId);

		const availableTags = forumChannel.availableTags;

		for (const tag of availableTags) {
			if (tag.name == data.gameplayMode) {
				data.tagId = tag.id;
			}
		}

		const lfgEmbed = new EmbedBuilder()
			.setColor(process.env.EMBED_COLOR)
			.setTitle(
				english
					? "Looking for Teammates"
					: korean
						? "팀원 모집"
						: "チームメンバー募集",
			)
			.setDescription(
				`**Gameplay Mode:** ${data.gameplayMode}\n**Region:** ${data.region}\n**Team Description:** ${data.teamDescription}\n**Language:** ${data.language}\n**Time:** ${data.time}`,
			)
			.setFooter({
				text: `Posted by ${interaction.user.username}`,
				iconURL: interaction.user.displayAvatarURL(),
			});

		const forumThread = await forumChannel.threads.create({
			name: `LFG | ${data.gameplayMode} | ${interaction.user.username}`,
			reason: interaction.user.username + " created a LFG thread",
			message: {
				embeds: [lfgEmbed],
			},
			...(data.tagId && { appliedTags: [data.tagId] }),
		});

		const threadMessage = await forumThread.fetchStarterMessage();
		const threadLink = messageLink(threadMessage.channel.id, threadMessage.id);

		const updatedEmbed = EmbedBuilder.from(lfgEmbed).setDescription(
			`${lfgEmbed.data.description}\n**Thread Link:** \n${codeBlock(
				threadLink,
			)}`,
		);

		await threadMessage.edit({ embeds: [updatedEmbed] });

		await modalReply.editReply({
			content: "Your LFG thread has been created: " + threadLink,
			components: [],
		});
	},
};
