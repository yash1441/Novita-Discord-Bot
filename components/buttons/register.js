const { inlineCode, hyperlink, channelMention } = require("discord.js");
const lark = require("../../utils/lark");
require("dotenv").config();

module.exports = {
	cooldown: 10,
	data: {
		name: "register",
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

        if (response.total) return await interaction.editReply({ content: "You have already registered." });

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
				"You have been registered successfully. Please click the Code Drop button to check if you have received a code later.",
		});
	},
};
