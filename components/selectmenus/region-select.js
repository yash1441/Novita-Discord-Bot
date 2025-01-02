const {
	bold,
	ModalBuilder,
	TextInputBuilder,
	ActionRowBuilder,
	TextInputStyle,
} = require("discord.js");
const lark = require("../../utils/lark");
require("dotenv").config();

module.exports = {
	data: {
		name: "region-select",
	},
	async execute(interaction) {
		let region = interaction.values[0];
		const discordId = interaction.user.id;

		if (region === "Others") {
			const modal = new ModalBuilder()
				.setCustomId("region-modal")
				.setTitle("Region");

			const regionInput = new TextInputBuilder()
				.setCustomId("region-input")
				.setLabel("Please enter your region")
				.setStyle(TextInputStyle.Short);

			const row = new ActionRowBuilder().addComponents(regionInput);
			modal.addComponents(row);

			await interaction.showModal(modal);

			const submit = await interaction
				.awaitModalSubmit({
					time: 60_000,
					filter: (i) => i.user.id === interaction.user.id,
				})
				.catch((error) => {
					console.log(error);
					return null;
				});

			if (submit) {
				region = submit.fields.getTextInputValue("region-input");
				await submit.reply({
					content: "Submitted",
					ephemeral: true,
				});
				await submit.deleteReply();
			} else {
				return await submit.reply({
					content: "Timed out.",
					ephemeral: true,
				});
			}
		}

		await interaction.message.edit({
			content: "Region selected!" + "\n" + bold(region),
			components: [],
		});

		const records = await lark.listRecords(
			process.env.COMMUNITY_POOL_BASE,
			process.env.REWARD_TABLE,
			{
				filter: `AND(CurrentValue.[Discord ID] = "${discordId}", CurrentValue.[Status] = "Region Required")`,
			}
		);

		if (!records.total || !records) return;

		await lark.updateRecord(
			process.env.COMMUNITY_POOL_BASE,
			process.env.REWARD_TABLE,
			records.items[0].record_id,
			{
				fields: {
					Region: region,
					Status: "Reward Required",
				},
			}
		);

		setTimeout(function () {
			interaction.channel.delete();
		}, 2_000);
	},
};
