const request = require('request');
const fs = require('fs');

module.exports = {
    name: 'messageCreate',
    execute(msg) {
        if (msg.content === "c!test") {
            console.log("Test completed");
            msg.reply("que onda pa");
        }
        if (msg.attachments.first()) {
            robarAttachment(msg.attachments.first().url);
        };
    },
}

function robarAttachment(url) {
    var timestamp = Math.floor(new Date().getTime()/1000);
    request.get(url)
        .on('error', console.error)
        .pipe(fs.createWriteStream("images/collateral/" + timestamp + '.png'))
    console.log("Robacion completada")
}