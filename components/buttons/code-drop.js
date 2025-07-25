const {
	inlineCode,
	hyperlink,
	channelMention,
	MessageFlags,
} = require("discord.js");
const lark = require("../../utils/lark");
require("dotenv").config();

module.exports = {
	cooldown: 10,
	data: {
		name: "code-drop",
	},
	async execute(interaction) {
		await interaction.deferReply({ flags: MessageFlags.Ephemeral });
		const discordId = interaction.user.id;
		const serverId = interaction.guildId;

		const response = await lark.listRecords(
			process.env.COMMUNITY_POOL_BASE,
			process.env.CODES_TABLE,
			{ filter: 'CurrentValue.[Discord ID] = "' + discordId + '"' }
		);

		if (response.total) {
			// Collect all activation codes for this user
			const codes = response.items
				.map((item) => item.fields["Activation Code"])
				.filter((code) => !!code);

			if (codes.length && serverId === process.env.GUILD_ID)
				return await interaction.editReply({
					content:
						"Congratulations, your Alpha keys are:\n" +
						codes.map(inlineCode).join("\n") +
						"\nPlease check " +
						hyperlink(
							"Activating a Product on Steam",
							"https://help.steampowered.com/en/faqs/view/2A12-9D79-C3D7-F870"
						) +
						" to activate the game. Have fun!",
				});
			else if (codes.length)
				return await interaction.editReply({
					content:
						"参加資格取得おめでとうございます！\n" +
						codes.map(inlineCode).join("\n") +
						"、" +
						hyperlink(
							"をチェックして",
							"https://help.steampowered.com/ja/faqs/view/2A12-9D79-C3D7-F870"
						) +
						"、ゲームを追加しましょう！",
				});
			else if (!codes.length && serverId === process.env.GUILD_ID)
				return await interaction.editReply({
					content:
						"At the moment, you have no Alpha key assigned to you. Don't worry; you can check the " +
						channelMention("1280845688305090570") +
						" and wait for the next batch of keys.",
				});
			else if (!codes.length)
				return await interaction.editReply({
					content:
						"今回『運命のトリガー: The Novita』クローズドαテストの参加資格に応募いただきありがとうございました。申し訳ありませんが、抽選の結果落選となりました。" +
						channelMention("1266229105083420783") +
						" をチェックして、次回のテストの参加抽選をお待ちください。または、https://bit.ly/fttnsteam  にアクセスし、『運命のトリガー: The Novita』の『アクセスをリクエスト』をクリックし、登録しましょう",
				});
		} else {
			return await interaction.editReply({
				content: "Please register first.",
			});
		}
	},
};
