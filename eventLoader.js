const reqEvent = (event) => require(`./events/${event}`);
module.exports = bot => {
    bot.once('ready', () => reqEvent('ready'));
};