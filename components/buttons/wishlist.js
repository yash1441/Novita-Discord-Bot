const { MessageFlags } = require("discord.js");
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

		const response = await lark.listRecords(
			process.env.COMMUNITY_POOL_BASE,
			process.env.WISHLIST_TABLE,
			{ filter: 'CurrentValue.[Discord ID] = "' + discordId + '"' }
		);

		if (!response.total)
			return await interaction.editReply({
				content:
					"You have not submitted your Steam Wishlist screenshot yet. Use the </wishlist:1384573611041361964> command to submit your screenshot first. Make sure it follows all the rules posted in the channel.",
			});

		const activationCode = response.items[0].fields["Activation Code"] ?? null;

		if (!activationCode)
			return await interaction.editReply({
				content:
					"Please wait for us to verify your Steam Wishlist screenshot. You will receive a Beta Key once your screenshot is verified.",
			});

		await interaction.editReply({
			content: `🎉 Congratulations! Here is your Beta Key: \`${activationCode}\`. To get started, please download the game launcher from our official website and use this key to activate it.\nOfficial Website: https://fatetrigger.com/\nSee you in the game, Awakeners!`,
		});
	},
};
