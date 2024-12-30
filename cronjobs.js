const {
	ThreadAutoArchiveDuration,
	ChannelType,
	StringSelectMenuBuilder,
	ActionRowBuilder,
	StringSelectMenuOptionBuilder,
	ActionRow,
} = require("discord.js");
const lark = require("./utils/lark");
require("dotenv").config();

module.exports = async (client) => {
	const records = await lark.listRecords(
		process.env.COMMUNITY_POOL_BASE,
		process.env.REWARD_TABLE,
		{
			filter: 'OR(CurrentValue.[Status] = "Start", CurrentValue.[Status] = "Ready to Send")',
		}
	);

	if (!records || !records.total)
		return console.log("No pending rewards found.");

	for (const record of records.items) {
		if (record.fields.Status === "Start") sendRegionSelect(client, record);
		else if (record.fields.Status === "Ready to Send")
			sendReward(client, record);
	}
};

async function sendRegionSelect(client, record) {
	const discordId = record.fields["Discord ID"];
	const recordId = record.record_id;
	const channel = await client.channels.fetch("1323108564922925127");
	const thread = await channel.threads.create({
		name: "Region: " + discordId,
		autoArchiveDuration: ThreadAutoArchiveDuration.OneWeek,
		type: ChannelType.PrivateThread,
		inviteable: false,
		reason: "User " + discordId + " needs to select a region",
	});

	await thread.join();
	await thread.members.add(discordId);

	const stringSelectMenu = new StringSelectMenuBuilder()
		.setCustomId("region-select")
		.setPlaceholder("Select your region")
		.addOptions(
			new StringSelectMenuOptionBuilder()
				.setLabel("United States")
				.setValue("United States")
				.setEmoji("🇺🇸"),
			new StringSelectMenuOptionBuilder()
				.setLabel("Canada")
				.setValue("Canada")
				.setEmoji("🇨🇦"),
			new StringSelectMenuOptionBuilder()
				.setLabel("Japan")
				.setValue("Japan")
				.setEmoji("🇯🇵"),
			new StringSelectMenuOptionBuilder()
				.setLabel("Brazil")
				.setValue("Brazil")
				.setEmoji("🇧🇷"),
			new StringSelectMenuOptionBuilder()
				.setLabel("Mexico")
				.setValue("Mexico")
				.setEmoji("🇲🇽"),
			new StringSelectMenuOptionBuilder()
				.setLabel("Thailand")
				.setValue("Thailand")
				.setEmoji("🇹🇭"),
			new StringSelectMenuOptionBuilder()
				.setLabel("Indonesia")
				.setValue("Indonesia")
				.setEmoji("🇮🇩"),
			new StringSelectMenuOptionBuilder()
				.setLabel("Russia")
				.setValue("Russia")
				.setEmoji("🇷🇺"),
			new StringSelectMenuOptionBuilder()
				.setLabel("Philippines")
				.setValue("Philippines")
				.setEmoji("🇵🇭"),
			new StringSelectMenuOptionBuilder()
				.setLabel("Vietnam")
				.setValue("Vietnam")
				.setEmoji("🇻🇳"),
			new StringSelectMenuOptionBuilder()
				.setLabel("Germany")
				.setValue("Germany")
				.setEmoji("🇩🇪"),
			new StringSelectMenuOptionBuilder()
				.setLabel("Finland")
				.setValue("Finland")
				.setEmoji("🇫🇮"),
			new StringSelectMenuOptionBuilder()
				.setLabel("Others")
				.setValue("Others")
		);

	const row = new ActionRowBuilder().addComponents(stringSelectMenu);

	await thread.send({
		content: "Please select your region:",
		components: [row],
	});

	await lark.updateRecord(
		process.env.COMMUNITY_POOL_BASE,
		process.env.REWARD_TABLE,
		recordId,
		{
			fields: {
				Status: "Region Required",
			},
		}
	);
}

async function sendReward(client, record) {
	return;
}
