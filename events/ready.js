const { DISCORD_CHANNEL_ID } = require ('../config.json')
module.exports = {
	name: 'ready',
	once: false,
	execute(bot) {
		console.log(`\n${bot.user.tag} online\n------------------------` );
        bot.user.setPresence({ activities: [{ name: 'Under development' }], status: 'Disconnected' });
	},	
};
