const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
    cooldown: 5,
    category: "management",
    data: new SlashCommandBuilder()
        .setName("delete-threads")
        .setDescription("Deletes all threads in the current channel")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction) {
        const channel = interaction.channel;

        if (!channel.isText()) {
            return interaction.reply(
                "This command can only be used in text channels."
            );
        }

        const threads = await channel.threads.fetchActive();
        const archivedThreads = await channel.threads.fetchArchived();

        const allThreads = threads.threads.concat(archivedThreads.threads);

        for (const thread of allThreads.values()) {
            await thread.delete();
        }

        await interaction.reply("All threads have been deleted.");
    },
};
