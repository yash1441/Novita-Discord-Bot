const { Events } = require("discord.js");
const cronjobs = require("../cronjobs.js");
const fs = require("fs");
const path = require("path");

function deleteAllWishlistFiles() {
	const rootDir = path.join(__dirname, "..");
	const files = fs.readdirSync(rootDir);
	files.forEach((file) => {
		if (file.endsWith("_wishlist.jpg")) {
			const filePath = path.join(rootDir, file);
			fs.unlinkSync(filePath);
			console.log(`Deleted: ${filePath}`);
		}
	});
}

module.exports = {
	name: Events.ClientReady,
	once: true,
	execute(client) {
		console.log(`Ready! Logged in as ${client.user.tag}`);

		// cronjobs(client);
		deleteAllWishlistFiles();
	},
};
