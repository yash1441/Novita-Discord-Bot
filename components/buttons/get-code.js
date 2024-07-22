const { bold, inlineCode, hyperlink } = require("discord.js");
const lark = require("../../utils/lark");
require("dotenv").config();

module.exports = {
	cooldown: 10,
	data: {
		name: "get-code",
	},
	async execute(interaction) {
		await interaction.deferReply({ ephemeral: true });
		const discordId = interaction.user.id;

		const response = await lark.listRecords(
			process.env.FEEDBACK_POOL_BASE,
			process.env.CODES_TABLE,
			{ filter: 'CurrentValue.[Discord ID] = "' + discordId + '"' }
		);

		if (!response)
			return await interaction.editReply({
				content:
					"You aren't registered. Please use the " +
					bold("Register") +
					" button to register.",
			});

		if (response.total) {
			const code = response.items[0].fields["Activation Code"];
			if (!code)
				return await interaction.editReply({
					content:
						"You currently have no code assigned to you or the code distribution hasn't begun. Please try again later.",
				});
			return await interaction.editReply({
				content: "Your activation code is " + inlineCode(code) + "\n" + hyperlink("Redeem on Steam", "https://store.steampowered.com/account/registerkey"),
			});
		} else
			return await interaction.editReply({
				content:
					"The code distribution hasn't begun. Please try again later.",
			});
	},
};
