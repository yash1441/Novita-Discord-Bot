const { inlineCode, hyperlink, channelMention } = require("discord.js");
const lark = require("../../utils/lark");
require("dotenv").config();

module.exports = {
	cooldown: 10,
	data: {
		name: "code-drop",
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

		if (response.total) {
			const code = response.items[0].fields["Activation Code"];

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
						"At the moment, you have no Alpha key assigned to you. Don't worry; you can check the " +
						channelMention("1280845688305090570") +
						" and wait for the next batch of keys.",
				});
			else if (!code)
				return await interaction.editReply({
					content:
						"今回は参加資格を取得できませんでした。" +
						channelMention("1266229105083420783") +
						" をチェックして、次回の資格配布をお待ちください。または、https://bit.ly/fttnsteam にアクセスし、『運命のトリガー: The Novita』の『アクセスをリクエスト』をクリックし、登録しましょう。",
				});
		}

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

		await interaction.editReply({
			content:
				"You have been registered successfully. Please click this button to check if you have received a code later.",
		});
	},
};