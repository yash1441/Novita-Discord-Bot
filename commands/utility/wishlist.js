const { SlashCommandBuilder, MessageFlags } = require("discord.js");
const fs = require("fs");
const path = require("path");
const request = require("request-promise");
const lark = require("../../utils/lark.js");

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
		const discordId = interaction.user.id;

		const attachment = interaction.options.getAttachment("proof");

		if (
			attachment.contentType !== "image/png" &&
			attachment.contentType !== "image/jpeg"
		) {
			return await interaction.editReply({
				content:
					"Please upload a valid image file (PNG or JPEG) as proof of your wishlist.",
			});
		}

		console.log(
			`Received wishlist proof from ${interaction.user.tag} (${discordId})`
		);

		await download(attachment.url, discordId + "_wishlist.jpg");

		console.log(`Downloaded wishlist proof for ${discordId}`);

		await interaction.editReply({
			content: `Thank you for submitting your wishlist proof! Please wait while we verify it.`,
		});
	},
};

async function download(url, name) {
	await request.head(url, function (err, res, body) {
		request(url).pipe(fs.createWriteStream(name));
	});
}
