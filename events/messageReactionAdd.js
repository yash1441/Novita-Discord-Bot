const { Events } = require("discord.js");
const lark = require("../utils/lark.js");
require("dotenv").config();

module.exports = {
	name: Events.MessageReactionAdd,
	async execute(reaction, user) {
		if (reaction.partial) {
			try {
				await reaction.fetch();
			} catch (error) {
				return console.error(error);
			}
		}

		const isBot = user.id == process.env.BOT_ID;
		const isVoteSuggestion = [
			process.env.VOTE_SUGGESTION_ID,
			process.env.VOTE_SUGGESTION_ID_JP,
		].includes(reaction.message.channel.parentId);
		const isVoteLine =
			reaction.message.channel.parentId == process.env.VOTE_LINE_ID;

		if (isBot || (!isVoteSuggestion && !isVoteLine)) return;

		let acceptCount, rejectCount, base, table, filter;

		if (isVoteSuggestion) {
			if (!["✅", "❌"].includes(reaction.emoji.name)) return;
			acceptCount = reaction.message.reactions.cache.get("✅").count - 1;
			rejectCount = reaction.message.reactions.cache.get("❌").count - 1;
			base = process.env.FEEDBACK_POOL_BASE;
			table = process.env.SUGGESTIONS_TABLE;
			filter = `AND(CurrentValue.[Suggestion Title] = "${reaction.message.channel.name}", CurrentValue.[Discord Name] = "${reaction.message.embeds[0].data.author.name}")`;
		} else if (isVoteLine) {
			if (!["❤️", "💔"].includes(reaction.emoji.name)) return;
			acceptCount = reaction.message.reactions.cache.get("❤️").count - 1;
			rejectCount = reaction.message.reactions.cache.get("💔").count - 1;
			base = process.env.COMMUNITY_POOL_BASE;
			table = process.env.LINE_TABLE;
			filter = `AND(CurrentValue.[Title] = "${reaction.message.channel.name}", CurrentValue.[Discord Username] = "${reaction.message.embeds[0].data.author.name}")`;
		}

		const response = await lark.listRecords(base, table, { filter });

		if (!response) {
			return console.warn(
				`Could not fetch record for: ${reaction.message.channel.name}`
			);
		}

		const success = await lark.updateRecord(
			base,
			table,
			response.items[0].record_id,
			{
				fields: {
					[reaction.emoji.name]:
						reaction.emoji.name === "✅" ||
						reaction.emoji.name === "❤️"
							? acceptCount
							: rejectCount,
				},
			}
		);

		if (!success) {
			return console.warn(
				`Could not add ${reaction.emoji.name} to ${reaction.message.id}`
			);
		}
	},
};
