const { SlashCommandBuilder } = require("discord.js");
const { execute } = require("../utility/ping");

module.exports = {
	cooldown: 60,
	category: "management",
	data: new SlashCommandBuilder()
		.setName("register")
		.setDescription("Registration for the game.")
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
				.setDescription("Which model is your CPU?")
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
				.setDescription("Which model is your GPU?")
				.setRequired(true)
				.setAutocomplete(true)
		),
	async autcomplete(interaction) {
		const focusedOption = interaction.options.getFocused(true);
		const focusedValue = interaction.options.getFocused();

		console.log(focusedOption, focusedValue);

		const pcCpuAmdChoices = [
			"Ryzen 9 7950X3D",
			"Ryzen 9 7950X",
			"Ryzen 9 7900X",
			"Ryzen 9 7900",
			"Ryzen 9 5950X",
			"Ryzen 7 7700X",
			"Ryzen 7 7700",
			"Ryzen 7 2700X",
			"Ryzen 7 2700",
			"Ryzen 7 1800X",
			"Ryzen 7 1700X",
			"Ryzen 5 3600",
			"Ryzen 5 3500X",
			"Ryzen 5 3400G",
			"Ryzen 5 2600X",
			"Ryzen 5 2600",
			"Ryzen 5 2500X",
			"Ryzen 3 3300X",
			"Ryzen 3 3100",
			"Others",
		];
		const pcCpuIntelChoices = [
			"i9-14900KS",
			"i9-14900K",
			"i9-13900KS",
			"i9-13900K",
			"i9-12900KS",
			"i9-12900K",
			"i9-9980XE",
			"i7-14700K",
			"i7-13790F",
			"i7-13700K",
			"i7-12700K",
			"i7-8700K",
			"i7-7700K",
			"i7-6950X",
			"i7-6700K",
			"i5-13600K",
			"i5-11600T",
			"i5-11500T",
			"i5-11400T",
			"i5-10400F",
			"i5-9600KF",
			"i5-9600K",
			"i5-9500,",
			"i3-9350K",
			"i3-9300",
			"i3-9100",
			"i3-8350K",
			"W-3175X",
			"E3-1230 v6",
			"E3-1230 v5",
			"Others",
		];
		const laptopCpuAmdChoices = [
			"Ryzen 9 7945HX3D",
			"Ryzen 9 7945HX",
			"Ryzen 9 7940HS",
			"Ryzen 9 8945HS",
			"Ryzen 9 5900HS",
			"Ryzen 7 8845HS",
			"Ryzen 7 7840HS",
			"Ryzen 7 7745HX",
			"Ryzen 7 7730U",
			"Ryzen 7 6800U",
			"Ryzen 7 5800",
			"Ryzen 5 7520U",
			"Ryzen 5 5600U",
			"Ryzen 5 5600HS",
			"Ryzen 5 5600H",
			"Ryzen 5 5500U",
			"Ryzen 5 4600U",
			"Ryzen 3 4300U",
			"Others",
		];
		const laptopCpuIntelChoices = [
			"Core i9-14900HX",
			"Core i9-13980HX",
			"Core i9-13950HX",
			"Core i9-13900HX",
			"Core i9-13900H",
			"Core i7-14650HX",
			"Core i7-13700HX",
			"Core i7-13700H",
			"Core i7-13650HX",
			"Core i7-13620H",
			"Core i5-13500HX",
			"Core i5-1345U",
			"Core i5-1340P",
			"Core i5-1240P",
			"Core i5-11500H",
			"Core i3-1115G4",
			"Core i3-10110U",
			"Core Ultra 9 185H",
			"Core Ultra 7 165H",
			"Core Ultra 7 165U",
			"Core Ultra 7 155H",
			"Others",
		];
		const test = ["A", "B"];

		if (focusedOption.name === "cpu-model") {
			if (
				interaction.options.getString("device") === "PC" &&
				interaction.options.getString("cpu") === "AMD"
			)
				await interaction.respond(pcCpuAmdChoices.map(mapped));
			else if (
				interaction.options.getString("device") === "PC" &&
				interaction.options.getString("cpu") === "Intel"
			)
				await interaction.respond(pcCpuIntelChoices.map(mapped));
			else if (
				interaction.options.getString("device") === "Laptop" &&
				interaction.options.getString("cpu") === "AMD"
			)
				await interaction.respond(laptopCpuAmdChoices.map(mapped));
			else if (
				interaction.options.getString("device") === "Laptop" &&
				interaction.options.getString("cpu") === "Intel"
			)
				await interaction.respond(laptopCpuIntelChoices.map(mapped));
		} else if (focusedOption.name === "gpu-model") {
			await interaction.respond(test.map(mapped));
		}
	},
	async execute(interaction) {
		const device = interaction.options.getString("device");
		const cpu = interaction.options.getString("cpu");
		const cpuModel = interaction.options.getString("cpu-model");
		const gpu = interaction.options.getString("gpu");
		const gpuModel = interaction.options.getString("gpu-model");

		await interaction.reply({
			content:
				device +
				"\n" +
				cpu +
				"\n" +
				cpuModel +
				"\n" +
				gpu +
				"\n" +
				gpuModel,
		});
	},
};

function mapped(choice, index) {
	return { name: choice, value: index };
}
