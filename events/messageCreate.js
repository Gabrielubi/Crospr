const request = require('request');
const fs = require('fs');

module.exports = {
    name: 'messageCreate',
    execute(msg) {
        if (msg.content === "c!test") {
            console.log("Test");
            msg.reply("Test");
        };

        if (msg.attachments.first()) {
            catchAttachment(msg.attachments.first().url);
        };
    }
};

function catchAttachment(url) {
    var timestamp = Math.floor(new Date().getTime() / 1000);
    request.get(url)
        .on('error', console.error)
        .pipe(fs.createWriteStream("images/collateral/" + timestamp + '.png'));
    console.log("I've got something from the server");
}