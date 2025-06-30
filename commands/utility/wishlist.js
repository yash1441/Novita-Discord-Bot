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
		const discordUsername = interaction.user.username;
		const serverId = interaction.guild.id;

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

		const response = await lark.listRecords(
			process.env.COMMUNITY_POOL_BASE,
			process.env.WISHLIST_TABLE,
			{ filter: 'CurrentValue.[Discord ID] = "' + discordId + '"' }
		);

		if (response.total) {
			return await interaction.editReply({
				content: "You have already submitted a wishlist proof.",
			});
		}

		const fileName = `${discordId}_wishlist.jpg`;

		await download(attachment.url, fileName);

		const imageToken = await lark.uploadFile(
			process.env.COMMUNITY_POOL_BASE,
			fileName,
			"bitable_image"
		);

		const data = {
			"Discord ID": discordId,
			"Discord Username": discordUsername,
			Server: serverId,
			Screenshot: [{ file_token: imageToken }],
		};

		const success = await lark.createRecord(
			process.env.COMMUNITY_POOL_BASE,
			process.env.WISHLIST_TABLE,
			{ fields: data }
		);

		if (success) {
			return await interaction.editReply({
				content:
					serverId === process.env.GUILD_ID
						? `✅ Submission successful! We are now processing your entry. You can check your status here again on July 23rd.`
						: `提出完了！<t:1753272000:d>以降に本チャンネルで、下記の『チェック』ボタンを押し、抽選結果を確認してください！`,
			});
		} else {
			return await interaction.editReply({
				content:
					"There was an error submitting your wishlist proof. Please try again later.",
			});
		}
	},
};

async function download(url, name) {
	await request.head(url, function (err, res, body) {
		request(url).pipe(fs.createWriteStream(name));
	});
}
