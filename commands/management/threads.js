const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
    cooldown: 5,
    category: "management",
    data: new SlashCommandBuilder()
        .setName("threads")
        .setDescription("Manage threads in the current channel")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addSubcommand((subcommand) =>
            subcommand
                .setName("delete")
                .setDescription("Delete all threads in the current channel")
        ),
    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();

        if (subcommand === "delete") {
            await interaction.deferReply({ ephemeral: true });
            const channel = interaction.channel;

            if (!channel.isTextBased()) {
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

            await interaction.editReply({
                content: "All threads have been deleted.",
            });
        }
    },
};
