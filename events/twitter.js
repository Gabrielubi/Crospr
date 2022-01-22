const Twit = require('twit');
const { TWITTER_CONSUMER_KEY, TWITTER_ACCESS_TOKEN_SECRET, TWITTER_ACCESS_TOKEN, TWITTER_CONSUMER_SECRET, TWITTER_USER_ID, DISCORD_CHANNEL_ID, YANDEX_TOKEN } = require('../config.json');
const disk = require('ya-disk');
const fs = require('fs');
const request = require('request');

module.exports = {
    name: 'ready',
    execute(bot) {
        let T = new Twit({
            consumer_key: TWITTER_CONSUMER_KEY,
            consumer_secret: TWITTER_CONSUMER_SECRET,
            access_token: TWITTER_ACCESS_TOKEN,
            access_token_secret: TWITTER_ACCESS_TOKEN_SECRET,
            timeout_ms: 60 * 1000,
            strictSSL: true,
        });

        //  follow:[] can be an array of users ID.
        let stream = T.stream('statuses/filter', { follow: [TWITTER_USER_ID], tweet_mode: 'extended' })
        const dest = DISCORD_CHANNEL_ID;
        
        try {
            stream.on('tweet', function (tweet) {
                //For some reason a retweeted message counts as a tweet. The 'tweet ID' is the only thing that really matters
                const twitterMessage = `https://twitter.com/Crospr/status/${tweet.id_str}`
                bot.channels.cache.get(dest).send(twitterMessage);
                let timestamp = Date.now();
                console.log(`-------New tweet!-------\n> ${new Date(timestamp).toLocaleTimeString()}`)

                if (tweet.entities.media == undefined) {
                    console.log("Can't find images... yet");
                    T.get('statuses/show/:id', { id: tweet.id_str, tweet_mode: 'extended' }, function (data) {
                        if (data.retweeted_status.extended_entities !== undefined) {
                            let index = 0;
                            console.log("Here they are");
                            for (var j of data.retweeted_status.extended_entities.media) {
                                let i = data.retweeted_status.extended_entities.media[index].media_url;
                                let dir = "images/" + tweet.id_str + index + ".png";
                                let path = 'disk:/Crospr/' + tweet.id_str + index + ".png";
                                catchTw(i, dir);
                                uploadTw(i, path);
                                index++
                            }
                        } else {
                            console.log("The tweet doesn't have images");
                        }
                    });

                } else {
                    let index = 0;
                    for (var j of tweet.extended_entities.media) {
                        let dir = "images/" + tweet.id_str + index + ".png";
                        let i = tweet.extended_entities.media[index].media_url;
                        let path = 'disk:/Crospr/' + tweet.id_str + index + ".png";
                        catchTw(i, dir);
                        uploadTw(i, path);
                        index++;
                    }
                }
            })
        }
        catch (e) {
            console.log("Here is the error : " + e);
        }

        stream.on('error', (e) =>{
            console.log(`${e}\nrestart in 40 seconds...`);
            //to do
        })

        stream.on('uncaughtException' , (e) =>{
            console.log(`Exception : ${e}\nrestart in 40 seconds...`);
            //to do
        })
    }
}

function uploadTw(url, path) {
    disk.upload.remoteFile(YANDEX_TOKEN, url, path);
    console.log("> Uploaded to cloud\n------------------------\n");
}

function catchTw(url, filename) {
    request(url).pipe(fs.createWriteStream(filename));
    console.log("> Downloaded to local files")
};