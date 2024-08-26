const { bold, inlineCode, hyperlink } = require("discord.js");
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

		server.id == process.env.GUILD_ID
			? (server.region = "EN")
			: (server.region = "JP");

		const response = await lark.listRecords(
			process.env.FEEDBACK_POOL_BASE,
			process.env.CODES_TABLE,
			{ filter: 'CurrentValue.[Discord ID] = "' + discordId + '"' }
		);

		if (response.total) {
			const code = response.items[0].fields["Activation Code"];

			if (code)
				return await interaction.editReply({
					content:
						"Your activation code is " + inlineCode(code) + ".",
				});

			return await interaction.editReply({
				content: "You do not have a code assigned yet. Please try again later.",
			});
		}

		const success = await lark.createRecord(
			process.env.FEEDBACK_POOL_BASE,
			process.env.CODES_TABLE,
			{
				fields: {
					"Discord ID": discordId,
					"Discord Username": username,
					"Server": serverId,
				},
			}
		);

        if (!success) return await interaction.editReply({ content: "Failed to register. Please try again later." });

        await interaction.editReply({ content: "You have been registered successfully. Please click this button to check if you have received a code later." });
	},
};
