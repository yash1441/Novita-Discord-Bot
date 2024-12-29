const {} = require("discord.js");
const lark = require("./utils/lark");
require("dotenv").config();

module.exports = async (client) => {
	const records = await lark.listRecords(
		process.env.COMMUNITY_POOL_BASE,
		process.env.REWARD_TABLE,
		{
			filter: 'CurrentValue.[Status] != "Reward Sent"',
		}
	);

    if (!records || !records.total) return console.log("No pending rewards found.");
};
