const { MessageFlags, inlineCode } = require("discord.js");
const lark = require("../../utils/lark");
require("dotenv").config();

module.exports = {
	cooldown: 10,
	data: {
		name: "wishlist",
	},
	async execute(interaction) {
		await interaction.deferReply({ flags: MessageFlags.Ephemeral });
		const discordId = interaction.user.id;
		const serverId = interaction.guildId;

		const response = await lark.listRecords(
			process.env.COMMUNITY_POOL_BASE,
			process.env.WISHLIST_TABLE,
			{ filter: 'CurrentValue.[Discord ID] = "' + discordId + '"' }
		);

		if (!response.total)
			return await interaction.editReply({
				content:
					serverId === process.env.GUILD_ID
						? "You have not submitted your Steam Wishlist screenshot yet. Use the </wishlist:1384573611041361964> command to submit your screenshot first. Make sure it follows all the rules posted in the channel."
						: "Steamのストアページで「運命のトリガー」をウィッシュリストに追加したことを示すスクリーンショットをアップロードしてください。チャンネルに記載されたすべてのルールに従っていることを確認してください。</wishlist:1384573611041361964>",
			});

		const activationCode = response.items[0].fields["Activation Code"] ?? null;

		if (!activationCode)
			return await interaction.editReply({
				content:
					serverId === process.env.GUILD_ID
						? "Thank you so much for participating in our Wishlist Event!\nWhile your entry wasn't chosen in this random giveaway, please don't be discouraged! You still have other great chances to get into the game:\n➡️ **Request Access on Steam:** Head to our official Steam page and click the **'Request Access'** button for another chance at direct entry.\n➡️ **Future Events:** Keep an eye on our official social media for more giveaways and community activities!\nSteam Page: <https://bit.ly/fttnsteam>\nOfficial Website: <https://fatetrigger.com/>\nWe truly appreciate your support and hope to see you in the game soon, Awakeners!\n- Follow us on X: <https://x.com/FateTrigger_EN>\n- Follow us on Facebook: <https://www.facebook.com/FateTrigger>\n- Follow us on Instagram:  <https://www.instagram.com/fatetrigger_eng/>"
						: "「βテスト参加資格抽選」イベントにご参加いただきありがとうございました。残念ながら今回のイベントではご当選されませんでした。ですが、他にも参加資格を獲得できる方法があります！\n➡️**Steamでのアクセスをリクエスト**\n公式Steamページにアクセスし、「アクセスリクエスト」ボタンをクリックすることで、βテストに参加できるチャンスがあります\n➡️ **公式SNSをフォロー:**\n運命のトリガー公式SNSのキャンペーンでも参加資格や豪華景品が当たるチャンスがありますので、ぜひ運命のトリガー公式SNSをフォローしてください!\n- 公式サイト： <https://fatetrigger.com/>\n- 公式Ｘ（旧Twitter）: <https://x.com/FateTrigger_JP>\n- 公式YouTube: <https://www.youtube.com/@FateTrigger_JP>",
			});

		await interaction.editReply({
			content:
				serverId === process.env.GUILD_ID
					? `🎉 Congratulations! Here is your Beta Key: ${inlineCode(
							activationCode
					  )}. To get started, please download the game launcher from our official website and use this key to activate it.\nOfficial Website: https://fatetrigger.com/\nSee you in the game, Awakeners!`
					: `ご入選おめでとうございます！\nこれは参加資格のコードです: ${inlineCode(
							activationCode
					  )}。公式サイトからゲームをダウンロードし、このコードを使ってゲームを有効化しましょう！\n公式サイトはこちらです: https://fatetrigger.com/`,
		});
	},
};
