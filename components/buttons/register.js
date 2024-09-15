const { inlineCode, hyperlink, channelMention } = require("discord.js");
const lark = require("../../utils/lark");
require("dotenv").config();

module.exports = {
	cooldown: 10,
	data: {
		name: "register",
	},
	async execute(interaction) {
		await interaction.deferReply({ ephemeral: true });
		const discordId = interaction.user.id;
		const username = interaction.user.username;
		const serverId = interaction.guildId;

		const response = await lark.listRecords(
			process.env.COMMUNITY_POOL_BASE,
			process.env.CODES_TABLE,
			{ filter: 'CurrentValue.[Discord ID] = "' + discordId + '"' }
		);

		if (response.total)
			return await interaction.editReply({
				content: "You have already registered.",
			});

		const success = await lark.createRecord(
			process.env.COMMUNITY_POOL_BASE,
			process.env.CODES_TABLE,
			{
				fields: {
					"Discord ID": discordId,
					"Discord Username": username,
					Server: serverId,
				},
			}
		);

		if (!success)
			return await interaction.editReply({
				content: "Failed to register. Please try again later.",
			});

		serverId === process.env.GUILD_ID
			? await interaction.editReply({
					content:
						"You have been registered successfully. Please click the Key Drop button to check if you have received a code later.",
			  })
			: await interaction.editReply({
					content:
						"  応募完了しました！9月23日以降に「抽選結果確認」ボタンを押して、抽選結果を確認してください！",
			  });
	},
};
