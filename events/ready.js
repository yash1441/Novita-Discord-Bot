const { Events } = require("discord.js");
const cronjobs = require('../cronjobs.js');

module.exports = {
	name: Events.ClientReady,
	once: true,
	execute(client) {
		console.log(`Ready! Logged in as ${client.user.tag}`);

		cronjobs(client);
	},
};
