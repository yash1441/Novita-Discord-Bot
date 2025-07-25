const {
	SlashCommandBuilder,
	PermissionFlagsBits,
	ChannelType,
	MessageFlags,
} = require("discord.js");

module.exports = {
	cooldown: 10,
	category: "management",
	data: new SlashCommandBuilder()
		.setName("delete-threads")
		.setDescription(
			"Delete all private threads in REWARD_CHANNEL with no messages"
		)
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageThreads),
	async execute(interaction) {
		await interaction.deferReply({ flags: MessageFlags.Ephemeral });

		const channelId = process.env.REWARD_CHANNEL;
		const channel = await interaction.guild.channels.fetch(channelId);
		if (!channel) {
			await interaction.editReply({ content: "Reward channel not found." });
			return;
		}

		let deletedCount = 0;

		// Fetch all active threads in the channel
		const threads = await channel.threads.fetch({ force: true });
		console.log(channel, threads);
		for (const [, thread] of threads.threads) {
			try {
				// Fetch up to 1 message to check if thread is empty
				const messages = await thread.messages.fetch({ limit: 1 });
				if (messages.size === 0) {
					await thread.delete("No messages in thread");
					deletedCount++;
					console.log(
						`Deleted thread: ${thread.name} (${thread.id}) - No messages`
					);
				} else {
					console.log(
						`Kept thread: ${thread.name} (${thread.id}) - Has messages`
					);
				}
			} catch (err) {
				console.error(
					`Error with thread: ${thread.name} (${thread.id}) - ${err.message}`
				);
			}
		}

		await interaction.editReply({
			content: `Deleted ${deletedCount} private threads with no messages.`,
		});
	},
};
