const { Client, Intents} = require('discord.js');
const fs = require('fs'); 
const { token } = require('./config.json');
// Bot instance. FLAGS.GUILDS for setup, FLAGS.GUILD_MESSAGES for the listener
const bot = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });

bot.login(token);

//Event loader
const eventFiles = fs.readdirSync('./events').filter(file => file.endsWith('.js'));
for (const file of eventFiles) {
	const event = require(`./events/${file}`);
	if (event.once) {
		bot.once(event.name, (...args) => event.execute(...args));
	} else {
		bot.on(event.name, (...args) => event.execute(...args));
	}
}
