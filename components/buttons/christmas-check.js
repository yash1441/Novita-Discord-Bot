const { inlineCode } = require("discord.js");
const lark = require("../../utils/lark.js");
require("dotenv").config();

module.exports = {
	data: {
		cooldown: 10,
		name: "christmas-check",
	},
	async execute(interaction) {
		await interaction.deferReply({ ephemeral: true });

		const serverId = interaction.guildId;

		const response = await lark.listRecords(
			process.env.COMMUNITY_POOL_BASE,
			process.env.CHRISTMAS_TABLE,
			{
				filter:
					'CurrentValue.[Discord ID] = "' + interaction.user.id + '"',
			}
		);

		if (!response || !response.total)
			return await interaction.editReply({
				content: "You didn't select a lucky number.",
			});

		if (response.items[0].fields["Steam Card Code"] !== undefined) {
			if (serverId === process.env.GUILD_ID) {
				return await interaction.editReply({
					content:
						"Well done! You have secured a spot in the top 10 by either hitting the correct number or coming very close to it!\n\nSteam gift card: " +
						inlineCode(
							response.items[0].fields["Steam Card Code"]
						) +
						"\n\nBeta key will be sent to the email address you entered before the Closed Beta.\n\nPlease make sure your email address is correct",
				});
			} else
				return await interaction.editReply({
					content:
						"おめでとうございます！正解または最も近い数字を答えた上位10名の一人です！\n\n※Amazonギフトカードは後日公式スタッフよりDMでご連絡いたします！\n\n※参加資格はβテスト開始前に入力したメールアドレスに送られます。 参加資格を送る際に使うアドレスを参加資格送付の前にお知らせしますので、そのアドレスからのメールを受け取れるよう設定をお願いいたします。",
				});
		} else {
			if (serverId === process.env.GUILD_ID) {
				return await interaction.editReply({
					content:
						"Sorry you didn't win this time. Keep an eye out for our next event, and thanks for joining in!",
				});
			} else
				return await interaction.editReply({
					content:
						"大変残念ですが、今回のイベントで賞品を獲得することはできませんでした。しかし、落ち込むことはありません。これからも様々なイベントが予定されていますので、ぜひ次回のチャンスをお楽しみに！いつもご参加ありがとうございます。",
				});
		}
	},
};
