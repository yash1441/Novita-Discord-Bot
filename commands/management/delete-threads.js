const {
	SlashCommandBuilder,
	PermissionFlagsBits,
	MessageFlags,
} = require("discord.js");

module.exports = {
	cooldown: 10,
	category: "management",
	data: new SlashCommandBuilder()
		.setName("delete-threads")
		.setDescription(
			"Delete all private threads in REWARD_CHANNEL with no messages",
		)
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageThreads),
	async execute(interaction) {
		await interaction.deferReply({ flags: MessageFlags.Ephemeral });

		const serverId = interaction.guildId;
		const channelId =
			serverId === process.env.GUILD_ID
				? process.env.REWARD_CHANNEL
				: process.env.REWARD_CHANNEL_JP;
		const channel = await interaction.guild.channels.fetch(channelId);
		if (!channel) {
			await interaction.editReply({ content: "Reward channel not found." });
			return;
		}

		console.log("Channel type:", channel.type); // Should be 0 (TextChannel) or 15 (ForumChannel)

		let deletedCount = 0;

		// Fetch all active threads in the channel
		const threads = await channel.threads.fetch();
		const archivedThreads = await channel.threads.fetchArchived();
		console.log("Threads fetched:", threads.threads.size);
		console.log("Archived threads fetched:", archivedThreads.threads.size);

		for (const [, thread] of threads.threads) {
			try {
				// Fetch up to 1 message to check if thread is empty
				const messages = await thread.messages.fetch({ limit: 1 });
				if (messages.size === 0) {
					await thread.delete("No messages in thread");
					deletedCount++;
					console.log(
						`Deleted thread: ${thread.name} (${thread.id}) - No messages`,
					);
				} else {
					console.log(
						`Kept thread: ${thread.name} (${thread.id}) - Has messages`,
					);
				}
			} catch (err) {
				console.error(
					`Error with thread: ${thread.name} (${thread.id}) - ${err.message}`,
				);
			}
		}

		await interaction.editReply({
			content: `Deleted ${deletedCount} threads with no messages.`,
		});
	},
};
