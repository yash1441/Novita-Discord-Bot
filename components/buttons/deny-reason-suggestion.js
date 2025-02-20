const {
	EmbedBuilder,
	ModalBuilder,
	TextInputBuilder,
	ButtonBuilder,
	ButtonStyle,
	TextInputStyle,
	ActionRowBuilder,
	userMention,
	MessageFlags,
	inlineCode,
} = require("discord.js");
require("dotenv").config();

module.exports = {
	data: {
		name: "deny-reason-suggestion",
	},
	async execute(interaction) {
		const embed = interaction.message.embeds[0];
		const userId = embed.footer.text;

		const modal = new ModalBuilder()
			.setCustomId("deny-reason-modal")
			.setTitle("Reason");

		const reasonInput = new TextInputBuilder()
			.setCustomId("reason")
			.setLabel("Enter the reason for denying this suggestion")
			.setStyle(TextInputStyle.Short)
			.setRequired(true);

		const firstActionRow = new ActionRowBuilder().addComponents(reasonInput);
		modal.addComponents(firstActionRow);

		await interaction.showModal(modal);

		const filter = (i) => i.customId === "deny-reason-modal";

		await interaction
			.awaitModalSubmit({ filter, time: 60_000 })
			.then(async (modalInteraction) => {
				const reason = modalInteraction.fields.getTextInputValue("reason");

				const deniedEmbed = EmbedBuilder.from(embed)
					.setColor(process.env.EMBED_COLOR_DENIED)
					.addFields(
						{
							name: "Decision",
							value: userMention(interaction.user.id),
							inline: true,
						},
						{
							name: "Reason",
							value: reason,
							inline: true,
						}
					);

				await interaction.message.edit({
					embeds: [deniedEmbed],
					components: [],
				});

				const guildButton = new ButtonBuilder()
					.setCustomId("guild-disabled")
					.setLabel(interaction.guild.name)
					.setStyle(ButtonStyle.Success)
					.setDisabled(true);

				const buttonRow = new ActionRowBuilder().addComponents(guildButton);

				await client.users
					.send(userId, {
						content:
							"Your suggestion has been denied with the following reason: " +
							inlineCode(reason),
						components: [buttonRow],
					})
					.catch(console.log("Failed to send DM to user " + userId));

				await modalInteraction
					.reply({
						content: "The suggestion has been denied.",
						flags: MessageFlags.Ephemeral,
					})
					.then(() => modalInteraction.deleteReply());
			})
			.catch(console.error);
	},
};
