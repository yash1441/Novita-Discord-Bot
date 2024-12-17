const {
	ModalBuilder,
	TextInputBuilder,
	TextInputStyle,
	ActionRowBuilder,
} = require("discord.js");
require("dotenv").config();

module.exports = {
	data: {
		cooldown: 10,
		name: "christmas-star",
	},
	async execute(interaction) {
		const serverId = interaction.guildId;

		const modal = new ModalBuilder()
			.setCustomId("christmas-star-modal")
			.setTitle("Christmas Star");

		const luckyNumber = new TextInputBuilder()
			.setCustomId("number")
			.setLabel("Your lucky number (0-999)")
			.setStyle(TextInputStyle.Short)
			.setPlaceholder("Enter a number between 0 and 999")
			.setRequired(true)
			.setMaxLength(3);

		const userEmail = new TextInputBuilder()
			.setCustomId("email")
			.setLabel("Your email")
			.setStyle(TextInputStyle.Short)
			.setPlaceholder("Enter your email")
			.setRequired(true);

		const userRegion = new TextInputBuilder()
			.setCustomId("region")
			.setLabel("Your region/country ")
			.setStyle(TextInputStyle.Short)
			.setPlaceholder("Enter your region/country")
			.setRequired(true);

		const firstActionRow = new ActionRowBuilder().addComponents(
			luckyNumber
		);
		const secondActionRow = new ActionRowBuilder().addComponents(userEmail);
		const thirdActionRow = new ActionRowBuilder().addComponents(userRegion);

		serverId === process.env.GUILD_ID
			? modal.addComponents(
					firstActionRow,
					secondActionRow,
					thirdActionRow
			  )
			: modal.addComponents(firstActionRow, secondActionRow);

		await interaction.showModal(modal);

		const modalReply = await interaction
			.awaitModalSubmit({
				time: 120_000,
				filter: (modalInteraction) =>
					modalInteraction.user.id === interaction.user.id,
			})
			.catch();

		if (!modalReply) return;

		const number = parseInt(modalReply.fields.getTextInputValue("number"));
		const email = modalReply.fields.getTextInputValue("email");
		const region = modalReply.fields.getTextInputValue("region") ?? "/";

		if (isNaN(number) || num < 0 || num > 999) {
			return await modalReply.reply({
				content: "Invalid number",
				ephemeral: true,
			});
		} else if (!email.includes("@") || !email.includes(".")) {
			return await modalReply.reply({
				content: "Invalid email",
				ephemeral: true,
			});
		}

		await modalReply.reply({
			content: number + email + region,
			ephemeral: true,
		});
	},
};
