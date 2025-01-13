const {
    EmbedBuilder,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    ActionRowBuilder,
    inlineCode,
    bold,
    MessageFlags,
} = require("discord.js");
const lark = require("../../utils/lark.js");
require("dotenv").config();

module.exports = {
    data: {
        cooldown: 10,
        name: "christmas-star",
    },
    async execute(interaction) {
        const serverId = interaction.guildId;
        const channel =
            serverId === process.env.GUILD_ID
                ? await interaction.client.channels.fetch(
                      process.env.CHRISTMAS_CHANNEL
                  )
                : await interaction.client.channels.fetch(
                      process.env.CHRISTMAS_CHANNEL_JP
                  );

        const modal = new ModalBuilder()
            .setCustomId("christmas-star-modal")
            .setTitle("Christmas Star");

        const luckyNumber = new TextInputBuilder()
            .setCustomId("number")
            .setLabel("Your lucky number (0-999)")
            .setStyle(TextInputStyle.Short)
            .setPlaceholder("Enter a number between 0 and 999")
            .setRequired(true)
            .setMaxLength(3);

        const userEmail = new TextInputBuilder()
            .setCustomId("email")
            .setLabel("Your email")
            .setStyle(TextInputStyle.Short)
            .setPlaceholder("Enter your email")
            .setRequired(true);

        const userRegion = new TextInputBuilder()
            .setCustomId("region")
            .setLabel("Your region/country ")
            .setStyle(TextInputStyle.Short)
            .setPlaceholder("Enter your region/country")
            .setRequired(true);

        const firstActionRow = new ActionRowBuilder().addComponents(
            luckyNumber
        );
        const secondActionRow = new ActionRowBuilder().addComponents(userEmail);
        const thirdActionRow = new ActionRowBuilder().addComponents(userRegion);

        serverId === process.env.GUILD_ID
            ? modal.addComponents(
                  firstActionRow,
                  secondActionRow,
                  thirdActionRow
              )
            : modal.addComponents(firstActionRow, secondActionRow);

        await interaction.showModal(modal);

        const modalReply = await interaction
            .awaitModalSubmit({
                time: 120_000,
                filter: (modalInteraction) =>
                    modalInteraction.user.id === interaction.user.id,
            })
            .catch();

        if (!modalReply) return;

        const number = parseInt(modalReply.fields.getTextInputValue("number"));
        const email = modalReply.fields.getTextInputValue("email");
        let region = "Japan";
        if (modalReply.fields.fields.has("region"))
            region = modalReply.fields.getTextInputValue("region");

        if (isNaN(number) || number < 0 || number > 999) {
            return await modalReply.reply({
                content: "Invalid number",
                flags: MessageFlags.Ephemeral,
            });
        } else if (!email.includes("@") || !email.includes(".")) {
            return await modalReply.reply({
                content: "Invalid email",
                flags: MessageFlags.Ephemeral,
            });
        }

        await modalReply.deferReply({ flags: MessageFlags.Ephemeral });

        const data = {
            "Discord ID": interaction.user.id,
            "Discord Username": interaction.user.username,
            Region: region,
            Number: number,
            Email: email,
        };

        const response = await lark.listRecords(
            process.env.COMMUNITY_POOL_BASE,
            process.env.CHRISTMAS_TABLE,
            {
                filter:
                    'CurrentValue.[Discord ID] = "' + data["Discord ID"] + '"',
            }
        );

        if (response && response.total)
            return await modalReply.editReply({
                content:
                    "You have already submitted your data. Your lucky number is " +
                    inlineCode(response.items[0].fields.Number) +
                    '.\nPlease click the "Check" button after <t:1735401540:d>(localized) to view the results!',
            });

        const success = await lark.createRecord(
            process.env.COMMUNITY_POOL_BASE,
            process.env.CHRISTMAS_TABLE,
            { fields: data }
        );

        if (!success)
            return await modalReply.editReply({
                content:
                    "Failed to submit your data. Please contact an administrator.",
            });

        await modalReply.editReply({
            content:
                bold("Your data is submitted.") +
                "\n\n" +
                inlineCode(number.toString()) +
                "\n" +
                inlineCode(email) +
                "\n" +
                inlineCode(region),
        });
        const embed = new EmbedBuilder()
            .setTitle(data["Discord Username"])
            .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
            .setColor(process.env.EMBED_COLOR);

        serverId === process.env.GUILD_ID
            ? embed.setDescription(
                  "Your lucky number is " +
                      inlineCode(data.Number) +
                      '.\nPlease click the "Check" button after <t:1735401540:d>(localized) to view the results!'
              )
            : embed.setDescription(
                  "あなた幸運の星の数字は " +
                      inlineCode(data.Number) +
                      "です.\n※12月28日（土）以降に「結果確認」ボタンを押して、結果を確認してください！"
              );

        await channel.send({ embeds: [embed] });
    },
};
