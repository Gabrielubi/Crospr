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
            if (msg.author.bot || msg.channel.type === "dm") return

            switch (msg.attachments.first().contentType) {
                case 'image/jpeg':
                case 'image/png':
                case 'image/webp':
                    catchAttachmentImage(msg.attachments.first().url , msg.attachments.first().contentType);
                    break;

                case 'image/gif':
                    catchAttachmentGif(msg.attachments.first().url);
                    break;

                case 'video/mp4':
                case 'video/webm':
                    catchAttachmentVideo(msg.attachments.first().url, msg.attachments.first().contentType);
                    break;

                default:
                    console.log(`There is an attachment but I cant recognize it`)
            }
        };
    }
};

function catchAttachmentImage(url , type) {
    console.log("I've got a image from the server");
    var timestamp = Math.floor(new Date().getTime() / 1000);
    if (type === 'image/webp'){
    request.get(url)
        .on('error', console.error)
        .pipe(fs.createWriteStream('media/collateral/image/' + timestamp + '.webp'));
    }else{
        request.get(url)
        .on('error', console.error)
        .pipe(fs.createWriteStream('media/collateral/image/' + timestamp + '.png'));
    }
    console.log("> Image downloaded")
}

function catchAttachmentVideo(url , type) {
    console.log("> I've got a video from the server");
    var timestamp = Math.floor(new Date().getTime() / 1000);
    if (type === 'video/webm'){
    request.get(url)
        .on('error', console.error)
        .pipe(fs.createWriteStream('media/collateral/video/' + timestamp + '.webm'));
    }else{
        request.get(url)
        .on('error', console.error)
        .pipe(fs.createWriteStream('media/collateral/video/' + timestamp + '.mp4'));
    }
    console.log("> Video downloaded")
}

function catchAttachmentGif(url) {
    console.log("> I've got a gif from the server");
    var timestamp = Math.floor(new Date().getTime() / 1000);
    request.get(url)
        .on('error', console.error)
        .pipe(fs.createWriteStream('media/collateral/gif/' + timestamp + '.gif'));
        console.log("> Gif downloaded");
}