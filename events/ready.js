module.exports = {
	name: 'ready',
	once: false,
	execute(bot) {
		console.log(`\n${bot.user.tag} online\n------------------------`);
		bot.user.setPresence({ activities: [{ name: "I mean, lolicon isn't ilegal" }], status: 'Disconnected' });
	},
};
