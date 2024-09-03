const { SlashCommandBuilder, bold, hyperlink } = require("discord.js");
const lark = require("../../utils/lark.js");
require("dotenv").config();

module.exports = {
	cooldown: 60,
	category: "management",
	data: new SlashCommandBuilder()
		.setName("check")
		.setDescription("Check your specs.")
		.addStringOption((option) =>
			option
				.setName("device")
				.setDescription("Choose your game device.")
				.setRequired(true)
				.addChoices(
					{ name: "PC", value: "PC" },
					{ name: "Laptop", value: "Laptop" }
				)
		)
		.addStringOption((option) =>
			option
				.setName("cpu")
				.setDescription("Which CPU does your device have?")
				.setRequired(true)
				.addChoices(
					{ name: "AMD", value: "AMD" },
					{ name: "Intel", value: "Intel" }
				)
		)
		.addStringOption((option) =>
			option
				.setName("cpu-model")
				.setDescription(
					"Which model is your CPU? Start typing for more options."
				)
				.setRequired(true)
				.setAutocomplete(true)
		)
		.addStringOption((option) =>
			option
				.setName("gpu")
				.setDescription("Which GPU does your device have?")
				.setRequired(true)
				.addChoices(
					{ name: "AMD", value: "AMD" },
					{ name: "NVIDIA", value: "NVIDIA" }
				)
		)
		.addStringOption((option) =>
			option
				.setName("gpu-model")
				.setDescription(
					"Which model is your GPU? Start typing for more options."
				)
				.setRequired(true)
				.setAutocomplete(true)
		),
	async autocomplete(interaction) {
		const focusedOption = interaction.options.getFocused(true);
		const focusedValue = interaction.options.getFocused();
		const words = focusedValue.toLowerCase().split(" ");

		const pcCpuAmdChoices = [
			"Threadripper 7980X",
			"Threadripper 7970X",
			"Threadripper 3990X",
			"Threadripper 3970X",
			"Threadripper 3960X",
			"Threadripper 2990WX",
			"Threadripper 2970WX",
			"Ryzen 9 7950X3D",
			"Ryzen 9 7950X",
			"Ryzen 9 7900X",
			"Ryzen 9 7900",
			"Ryzen 9 5950X",
			"Ryzen 9 5900X",
			"Ryzen 9 3950X",
			"Ryzen 7 7700X",
			"Ryzen 7 7700",
			"Ryzen 7 2700X",
			"Ryzen 7 2700",
			"Ryzen 7 1800X",
			"Ryzen 7 1700X",
			"Ryzen 7 1700",
			"Ryzen 5 3600",
			"Ryzen 5 3500X",
			"Ryzen 5 3400G",
			"Ryzen 5 2600X",
			"Ryzen 5 2600",
			"Ryzen 5 2500X",
			"Ryzen 5 1600X",
			"Ryzen 5 1600",
			"Ryzen 5 1500X",
			"Ryzen 3 3300X",
			"Ryzen 3 3100",
			"Others",
		];
		const pcCpuIntelChoices = [
			"Xeon W-3175X",
			"Xeon E3-1230 v6",
			"Xeon E3-1230 v5",
			"i9-9980XE",
			"i9-14900KS",
			"i9-14900K",
			"i9-13900KS",
			"i9-13900K",
			"i9-12900KS",
			"i9-12900K",
			"i9-10980XE",
			"i7-8700K",
			"i7-7700K",
			"i7-6950X",
			"i7-6700K",
			"i7-14700K",
			"i7-13790F",
			"i7-13700K",
			"i7-12700K",
			"i5-9600KF",
			"i5-9600K",
			"i5-9500",
			"i5-9400F",
			"i5-9 400",
			"i5-8600K",
			"i5-8600",
			"i5-8500",
			"i5-8400",
			"i5-7600K",
			"i5-6600K",
			"i5-13600K",
			"i5-11600T",
			"i5-11500T",
			"i5-11400T",
			"i5- 10400F",
			"i3-9350K",
			"i3-9300",
			"i3-9100",
			"i3-8350K",
			"Others",
		];
		const laptopCpuAmdChoices = [
			"Ryzen 9 7945HX3D",
			"Ryzen 3 4300U",
			"Ryzen 5 2600H",
			"Ryzen 5 3500U",
			"Ryzen 5 3550H",
			"Ryzen 5 3580U",
			"Ryzen 5 4500U",
			"Ryzen 5 4600H",
			"Ryzen 5 4600U",
			"Ryzen 5 5500U",
			"Ryzen 5 5600H",
			"Ryzen 5 5600HS",
			"Ryzen 5 5600U",
			"Ryzen 5 7520U",
			"Ryzen 7 2800H",
			"Ryzen 7 3700U",
			"Ryzen 7 3750H",
			"Ryzen 7 4700U",
			"Ryzen 7 4800H",
			"Ryzen 7 4800HS",
			"Ryzen 7 4800U",
			"Ryzen 7 4980U Surface",
			"Ryzen 7 5700U",
			"Ryzen 7 5800HS",
			"Ryzen 7 5800U",
			"Ryzen 7 6800U",
			"Ryzen 7 7730U",
			"Ryzen 7 7745HX",
			"Ryzen 7 7840HS",
			"Ryzen 7 8845HS",
			"Ryzen 7 PRO 4750U",
			"Ryzen 9 4900H",
			"Ryzen 9 4900HS",
			"Ryzen 9 5900HS",
			"Ryzen 9 7940HS",
			"Ryzen 9 7945HX",
			"Ryzen 9 8945HS",
			"Others",
		];
		const laptopCpuIntelChoices = [
			"i3-10110U",
			"i3-1115G4",
			"i5-10200H",
			"i5-10210U",
			"i5-10300H",
			"i5-1030G7",
			"i5-10310U",
			"i5-1035G1",
			"i5-1035G4",
			"i5-1035G7",
			"i5-1038NG7",
			"i5-10400H",
			"i5-10500H",
			"i5-11260H",
			"i5-11300H",
			"i5-11320H",
			"i5-1135G7",
			"i5-11400H",
			"i5-1145G7",
			"i5-11500H",
			"i5-1240P",
			"i5-1340P",
			"i5-13 45U",
			"i5-13500HX",
			"i5-8257U",
			"i5-8259U",
			"i5-8265U",
			"i5-8279U",
			"i5-8300H",
			"i5-8350U",
			"i5-8365U",
			"i5-8400H",
			"i5-9300H",
			"i5-9400H",
			"i7-1051 0U",
			"i7-1060G7",
			"i7-10610U",
			"i7-1065G7",
			"i7-1068NG7",
			"i7-10710U",
			"i7-10750H",
			"i7-10810U",
			"i7-10850H",
			"i7-10870H",
			"i7-10875H",
			"i7-11370H",
			"i7-11375H",
			"i7-11390H",
			"i7-11600H",
			"i7-1165G7",
			"i7-11800H",
			"i7-1180G7",
			"i7-1185G7",
			"i7-1195G7",
			"i7-12800H",
			"i7-12800HX",
			"i7-12850HX",
			"i7-13 55U",
			"i7-13620H",
			"i7-13650HX",
			"i7-13700H",
			"i7-13700HX",
			"i7-1370P",
			"i7-14650HX",
			"i7-8550U",
			"i7-8559U",
			"i7-8565U",
			"i7-8650U",
			"i7-8665U",
			"i 7-8705G",
			"i7-8706G",
			"i7-8709G",
			"i7-8750H",
			"i7-8809G",
			"i7-8850H",
			"i7-9750H",
			"i7-9850H",
			"i7-9880H",
			"i9-10885H",
			"i9-10980HK",
			"i9-12900H",
			"i 9-12900HK",
			"i9-12900HX",
			"i9-12950HX",
			"i9-13900H",
			"i9-13900HX",
			"i9-13950HX",
			"i9-13980HX",
			"i9-14900HX",
			"i9-8950HK",
			"i9-9880H",
			"i9-9980HK",
			"Ultra 5 125H",
			"Ultra 5 125U",
			"Ultra 7 155H",
			"Ultra 7 155U",
			"Ultra 7 165H",
			"Ultra 7 165U",
			"Ultra 9 185H",
			"Others",
		];
		const pcGpuAmdChoices = ["AMD"];
		const pcGpuNvidiaChoices = [
			"RTX 4090",
			"RTX 4090D",
			"RTX 4080 SUPER",
			"RTX 4080",
			"RTX 4070 Ti SUPER",
			"RTX 4070 Ti",
			"RTX 3090 Ti",
			"RTX 3090",
			"RTX 4070 SUPER",
			"RTX 4070",
			"RTX 3080 Ti",
			"RTX 3080 12GB",
			"RTX 3080",
			"RTX 4060 Ti",
			"RTX 3070 Ti",
			"RTX 3070",
			"Titan RTX",
			"RTX 2080 Ti",
			"Titan V",
			"Titan Xp",
			"GTX Titan Z",
			"Titan X",
			"RTX 3060",
			"GTX 1080 Ti",
			"RTX 2080 Super",
			"RTX 2070 Super",
			"RTX 2080",
			"RTX 3060 Ti",
			"RTX 4060",
			"RTX 3060",
			"RTX 2070",
			"RTX 2060 Super",
			"GTX 1080",
			"GTX 1070 Ti",
			"RTX 3050",
			"GTX Titan X",
			"GTX 1070",
			"RTX 2060",
			"GTX 1660 Ti",
			"RTX 3050",
			"GTX 1660 Super",
			"RTX 4050",
			"Others",
		];
		const laptopGpuAmdChoices = ["AMD"];
		const laptopGpuNvidiaChoices = [
			"RTX 4090",
			"RTX 4080",
			"RTX 3080 Ti",
			"RTX 4070",
			"RTX 3080",
			"RTX 3070 Ti",
			"RTX 3070",
			"RTX 2080 Super",
			"RTX 4060",
			"RTX 2080",
			"RTX 2070 Super",
			"RTX 2080 Super Max-Q",
			"RTX 3060",
			"RTX 4050",
			"RTX 2080 Max-Q",
			"GTX 1080",
			"RTX 2070",
			"RTX 2070 Super Max-Q",
			"GTX 1080 Max-Q",
			"RTX 2070 Max-Q",
			"Others",
		];

		const device = interaction.options.getString("device") ?? "PC";
		const cpu = interaction.options.getString("cpu") ?? "Intel";
		const gpu = interaction.options.getString("gpu") ?? "NVIDIA";

		const choices = {
			PC: {
				"cpu-model": {
					AMD: pcCpuAmdChoices,
					Intel: pcCpuIntelChoices,
				},
				"gpu-model": {
					NVIDIA: pcGpuNvidiaChoices,
					AMD: pcGpuAmdChoices,
				},
			},
			Laptop: {
				"cpu-model": {
					AMD: laptopCpuAmdChoices,
					Intel: laptopCpuIntelChoices,
				},
				"gpu-model": {
					NVIDIA: laptopGpuNvidiaChoices,
					AMD: laptopGpuAmdChoices,
				},
			},
		};

		const filtered = choices[device][focusedOption.name][
			focusedOption.name.includes("cpu") ? cpu : gpu
		].filter((choice) => {
			const choiceLower = choice.toLowerCase();
			return (
				words.every((word) => choiceLower.includes(word)) ||
				words.some((word) => choiceLower.includes(word))
			);
		});

		filtered.sort((a, b) => {
			const aScore = words.reduce(
				(score, word) =>
					score + (a.toLowerCase().includes(word) ? 1 : 0),
				0
			);
			const bScore = words.reduce(
				(score, word) =>
					score + (b.toLowerCase().includes(word) ? 1 : 0),
				0
			);
			return bScore - aScore;
		});

		let options;
		if (filtered.length > 25) {
			options = filtered.slice(0, 25);
		} else {
			options = filtered;
		}

		await interaction.respond(
			options.map((choice) => ({ name: choice, value: choice }))
		);
	},
	async execute(interaction) {
		const device = interaction.options.getString("device");
		const cpu = interaction.options.getString("cpu");
		const cpuModel = interaction.options.getString("cpu-model");
		const gpu = interaction.options.getString("gpu");
		const gpuModel = interaction.options.getString("gpu-model");
		const serverId = interaction.guildId;

		if (gpu === "AMD" || gpuModel === "Others") {
			if (serverId === process.env.GUILD_ID)
				return await interaction.reply({
					content:
						"Unfortunately, you do not meet the hardware requirements needed for this test.  However, you can visit" +
						hyperlink("this link", "https://bit.ly/fttnsteam") +
						", and click " +
						bold("Request Access") +
						" under " +
						bold("Join Fate Trigger: The Novita Playtest") +
						" to sign up for future opportunities. We will get back to you asap. We apologize for any inconvenience and thank you for your interest.",
					ephemeral: true,
				});
			else
				return await interaction.reply({
					content:
						"申し訳ありませんが、このテストに必要なハードウェア要件を満たしていません。「運命のトリガー：The Novita」のSteamストアページを訪れ、「アクセスをリクエスト」をクリックして、登録してください。できるだけ早くご連絡いたします。ご不便をおかけしますが、ご理解いただきありがとうございます",
					ephemeral: true,
				});
		}

		if (serverId === process.env.GUILD_ID)
			await interaction.reply({
				content:
					"Congratulations, your specs are ready to go! Tired of waiting in line? There are two ways to get the alpha key for early access:\n1. " +
					bold("Application:") +
					" Complete the application on https://bit.ly/fttn by filling out the survey.\n2. " +
					bold("Discord Drops:") +
					" Visit our Discord https://discord.gg/fatetrigger for a chance to win an alpha key.",
				ephemeral: true,
			});
		else
			await interaction.reply({
				content:
					"おめでとうございます、あなたのスペックは問題ありません！長時間の待機に疲れたら、早期アクセス用のアクティベーションコードを取得する2つの方法があります：\n1. 公式サイトでの応募：公式サイト<官网链接>のアンケートに情報を記入すると、参加資格を得るチャンスがあります。\n2. Discordでの抽選：公式Discordのイベントに参加すると、抽選で参加資格を得るチャンスがあります。",
				ephemeral: true,
			});

		const data = {
			"Discord ID": interaction.user.id,
			"Discord Username": interaction.user.username,
			Server: serverId,
			Device: device,
			CPU: cpu,
			"CPU Model": cpuModel,
			GPU: gpu,
			"GPU Model": gpuModel,
		};

		const success = await lark.createRecord(
			process.env.FEEDBACK_POOL_BASE,
			process.env.SPEC_TABLE,
			{ fields: data }
		);
		if (!success) console.log("Failed to create record in lark");
	},
};

function mapped(choice, index) {
	return { name: choice, value: (index + 1).toString() };
}
