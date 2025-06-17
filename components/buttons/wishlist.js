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
					"You have not submitted your wishlist yet. Use the </wishlist:1384573611041361964> command to submit your wishlist first.",
			});

		const activationCode = response.items[0].fields["Activation Code"] ?? null;

		if (!activationCode)
			return await interaction.editReply({
				content:
					"Please wait for us to verify your wishlist. You will receive an activation code once your wishlist is verified.",
			});

		await interaction.editReply({
			content: `Your activation code is: \`${activationCode}\`. Please keep it safe.`,
		});
	},
};
