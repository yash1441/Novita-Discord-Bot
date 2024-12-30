const { bold } = require("discord.js");
const lark = require("../../utils/lark");
require("dotenv").config();

module.exports = {
	data: {
		name: "region-select",
	},
	async execute(interaction) {
		const region = interaction.values[0];
		const discordId = interaction.user.id;

		await interaction.update({
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

        setTimeout(function() {
            interaction.channel.delete();
          }, 2_000);
	},
};
