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
			const eligibility = response.items[0].fields["Eligibility"][0].text;
			if (!code && eligibility === "Eligible")
				return await interaction.editReply({
					content:
						"You currently have no code assigned to you. Please try again later.",
				});
			else if (eligibility === "Ineligible")
				return await interaction.editReply({
					content:
						"Unfortunately, you do not meet the hardware requirements needed for this test. We apologize for any inconvenience and thank you for your interest. Please stay tuned for future opportunities.",
				});
			return await interaction.editReply({
				content:
					"Your activation code is " +
					inlineCode(code) +
					"\n" +
					hyperlink(
						"Redeem on Steam",
						"https://store.steampowered.com/account/registerkey"
					),
			});
		} else
			return await interaction.editReply({
				content:
					"You have not registered yet. Please register first and then try again later.",
			});
	},
};
