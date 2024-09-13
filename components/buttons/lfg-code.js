const { inlineCode, hyperlink } = require("discord.js");
const lark = require("../../utils/lark");
require("dotenv").config();

module.exports = {
	cooldown: 10,
	data: {
		name: "lfg-code",
	},
	async execute(interaction) {
		await interaction.deferReply({ ephemeral: true });
		const discordId = interaction.user.id;
		const serverId = interaction.guildId;

		const response = await lark.listRecords(
			process.env.COMMUNITY_POOL_BASE,
			process.env.LFG_TABLE
		);

		if (!response || !response.total)
			return await interaction.editReply({
				content:
					"LFG code distribution hasn't begun yet. Please register using </lfg:1282419110327877642> and check later.",
			});

		let found = false;
		let code = "";

		for (const record of response.items) {
			if (record.fields["Captain"] === discordId) {
				found = true;
				code = record.fields["Captain Code"];
				break;
			} else if (record.fields["Member 1"] === discordId) {
				found = true;
				code = record.fields["Member 1 Code"];
				break;
			} else if (record.fields["Member 2"] === discordId) {
				found = true;
				code = record.fields["Member 2 Code"];
				break;
			} else if (record.fields["Member 3"] === discordId) {
				found = true;
				code = record.fields["Member 3 Code"];
				break;
			}
		}

		if (!found)
			return await interaction.editReply({
				content:
					"You are not in any LFG group. Please register using </lfg:1282419110327877642> and check later.",
			});

		if (code && serverId === process.env.GUILD_ID)
			return await interaction.editReply({
				content:
					"Congratulations, your Alpha key is " +
					inlineCode(code) +
					". Please check " +
					hyperlink(
						"Activating a Product on Steam",
						"https://help.steampowered.com/en/faqs/view/2A12-9D79-C3D7-F870"
					) +
					" to activate the game. Have fun!",
			});
		else if (code)
			return await interaction.editReply({
				content:
					"参加資格取得おめでとうございます！ " +
					inlineCode(code) +
					"、" +
					hyperlink(
						"をチェックして",
						"https://help.steampowered.com/ja/faqs/view/2A12-9D79-C3D7-F870"
					) +
					"、ゲームを追加しましょう！",
			});
		else if (!code && serverId === process.env.GUILD_ID)
			return await interaction.editReply({
				content:
					"At the moment, you have no Alpha key assigned to you. Please try again later.",
			});
	},
};
