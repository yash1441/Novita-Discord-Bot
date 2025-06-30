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
						? "Please wait for us to verify your Steam Wishlist screenshot. You will receive a Beta Key once your screenshot is verified."
						: "Steamウィッシュリストのスクリーンショットの確認が完了するまでお待ちください。スクリーンショットの確認が完了すると、ベータキーが送信されます。",
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
