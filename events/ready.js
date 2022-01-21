module.exports = {
	name: 'ready',
	once: true,
	execute(bot) {
		console.log(`\n${bot.user.tag} online\n------------------------` );
        bot.user.setPresence({ activities: [{ name: 'D10S es de Argentinos y de Bokita papá' }], status: 'asd' });
	},
};
