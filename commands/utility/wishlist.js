const { SlashCommandBuilder, MessageFlags } = require("discord.js");

module.exports = {
	cooldown: 5,
	category: "utility",
	data: new SlashCommandBuilder()
		.setName("wishlist")
		.setDescription("Submit wishlist for verification")
		.addAttachmentOption((option) =>
			option
				.setName("proof")
				.setDescription("Upload your wishlist proof here")
				.setRequired(true)
		),
	async execute(interaction) {
		await interaction.deferReply({ flags: MessageFlags.Ephemeral });

		const attachment = interaction.options.getAttachment("proof");

		console.log(attachment);

		await interaction.editReply({
			content: `Thank you for submitting your wishlist proof! Please wait while we verify it.`,
		});
	},
};
