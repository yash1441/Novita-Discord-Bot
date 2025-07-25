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
			"Delete all threads in this channel that don't have a starter message"
		)
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageThreads),
	async execute(interaction) {
		await interaction.deferReply({ flags: MessageFlags.Ephemeral });

		let deletedCount = 0;

		// Fetch all threads in the channel
		const threads = await interaction.channel.threads.fetchActive();
		for (const [, thread] of threads.threads) {
			try {
				const starterMessage = await thread.fetchStarterMessage();
				if (!starterMessage) {
					await thread.delete("No starter message found");
					// deletedCount++;
				}
			} catch (err) {
				// If fetchStarterMessage throws, treat as no starter message
				await thread.delete("No starter message found (error)");
				// deletedCount++;
			}
		}

		await interaction.editReply({
			content: `Deleted ${deletedCount} threads without a starter message.`,
		});
	},
};
