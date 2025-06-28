const {
	MessageFlags,
	StringSelectMenuBuilder,
	StringSelectMenuOptionBuilder,
	ActionRowBuilder,
} = require("discord.js");
const lark = require("../../utils/lark");
require("dotenv").config();

module.exports = {
	cooldown: 10,
	data: {
		name: "create-group-profile",
	},
	async execute(interaction) {
		await interaction.deferReply({ flags: MessageFlags.Ephemeral });

		const serverId = interaction.guildId;

		const forumChannel = await interaction.client.channels.fetch(
			serverId === process.env.GUILD_ID
				? process.env.LFG_CHANNEL
				: process.env.LFG_CHANNEL_JP
		);

		const availableTags = forumChannel.availableTags;

		const selectMenu = new StringSelectMenuBuilder()
			.setCustomId("lfg-gameplay-mode")
			.setPlaceholder("What gameplay mode do you play?");

		for (const tag of availableTags) {
			selectMenu.addOptions(
				new StringSelectMenuOptionBuilder()
					.setLabel(tag.name)
					.setValue(tag.name)
			);
		}

		const row = new ActionRowBuilder().addComponents(selectMenu);

		await interaction.editReply({
			content: "Gameplay Mode Selection",
			components: [row],
		});
	},
};
