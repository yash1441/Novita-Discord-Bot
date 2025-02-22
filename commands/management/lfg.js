const {
    SlashCommandBuilder,
    userMention,
    MessageFlags,
} = require("discord.js");
const lark = require("../../utils/lark.js");
require("dotenv").config();

module.exports = {
    cooldown: 60,
    category: "management",
    data: new SlashCommandBuilder()
        .setName("lfg")
        .setDescription("Submit looking-for-game details.")
        .addUserOption((option) =>
            option
                .setName("member-1")
                .setDescription("Choose a member (1)")
                .setRequired(true)
        )
        .addUserOption((option) =>
            option
                .setName("member-2")
                .setDescription("Choose a member (2)")
                .setRequired(true)
        )
        .addUserOption((option) =>
            option
                .setName("member-3")
                .setDescription("Choose a member (3)")
                .setRequired(true)
        )
        .addStringOption((option) =>
            option
                .setName("message-link")
                .setDescription("Enter your message link for LFG")
                .setRequired(true)
        ),
    async execute(interaction) {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        const captain = interaction.user;
        const member1 = interaction.options.getUser("member-1");
        const member2 = interaction.options.getUser("member-2");
        const member3 = interaction.options.getUser("member-3");
        const messageLink = interaction.options.getString("message-link");
        const serverId = interaction.guildId;

        if (
            captain.id === member1.id ||
            captain.id === member2.id ||
            captain.id === member3.id ||
            member1.id === member2.id ||
            member1.id === member3.id ||
            member2.id === member3.id
        ) {
            console.log("You entered duplicate users. Please try again.");
        }

        const teamIds = [captain.id, member1.id, member2.id, member3.id];
        const teamCalls = ["Captain", "Member 1", "Member 2", "Member 3"];

        const response = await lark.listRecords(
            process.env.COMMUNITY_POOL_BASE,
            process.env.LFG_TABLE
        );

        if (!response) return console.log("Failed to fetch LFG");

        let found = response.items.some((record) => {
            return teamIds.some((discordId) =>
                teamCalls.some((field) => record.fields[field] === discordId)
            );
        });

        if (found)
            return await interaction.editReply({
                content: "You have already submitted LFG details.",
            });

        const success = await lark.createRecord(
            process.env.COMMUNITY_POOL_BASE,
            process.env.LFG_TABLE,
            {
                fields: {
                    Captain: captain.id,
                    "Captain Username": captain.username,
                    "Member 1": member1.id,
                    "Member 1 Username": member1.username,
                    "Member 2": member2.id,
                    "Member 2 Username": member2.username,
                    "Member 3": member3.id,
                    "Member 3 Username": member3.username,
                    Message: { text: "Message Link", link: messageLink },
                    Server: serverId,
                },
            }
        );

        if (success)
            await interaction.editReply({
                content:
                    "LFG details submitted successfully. Team members are:\n" +
                    userMention(captain.id) +
                    "\n" +
                    userMention(member1.id) +
                    "\n" +
                    userMention(member2.id) +
                    "\n" +
                    userMention(member3.id) +
                    "\n" +
                    messageLink,
            });
        else console.log("Error submitting LFG details");
    },
};
