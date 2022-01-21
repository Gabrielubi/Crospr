const Twit = require('twit'); //Twitter streaming API
const { TWITTER_CONSUMER_KEY, TWITTER_ACCESS_TOKEN_SECRET, TWITTER_ACCESS_TOKEN, TWITTER_CONSUMER_SECRET, TWITTER_USER_ID, DISCORD_CHANNEL_ID, YANDEX_TOKEN } = require('../config.json');
const disk = require('ya-disk')  //yandex API 
const fs = require('fs');
const request = require('request');

module.exports = {
    name: 'ready',
    execute(bot) {
        var T = new Twit({
            consumer_key: TWITTER_CONSUMER_KEY,
            consumer_secret: TWITTER_CONSUMER_SECRET,
            access_token: TWITTER_ACCESS_TOKEN,
            access_token_secret: TWITTER_ACCESS_TOKEN_SECRET,
            timeout_ms: 60 * 1000,  // optional HTTP request timeout to apply to all requests.
            strictSSL: true,     // optional - requires SSL certificates to be valid.
        })

        //  filter the twitter public stream to only the user ID. It can be an array of users ID.
        var stream = T.stream('statuses/filter', { follow: [TWITTER_USER_ID], tweet_mode: 'extended' })
        const dest = DISCORD_CHANNEL_ID;
        stream.on('tweet', function (tweet) {
            //For some reason the retweeted message counts as a tweet. The 'tweet ID' is the only thing that really matters
            const twitterMessage = `https://twitter.com/Crospr/status/${tweet.id_str}`
            bot.channels.cache.get(dest).send(twitterMessage);
            console.log(`------Tweet nuevo!------`)

            if (tweet.entities.media == undefined) {
                console.log("El tweet no tiene imagenes... por ahora");

                try {
                    T.get('statuses/show/:id', { id: tweet.id_str, tweet_mode: 'extended' }, function (err, data, response) {
                        if (data.retweeted_status.extended_entities !== undefined) {
                            let index = 0;
                            for (var j of data.retweeted_status.extended_entities.media) {
                                var i = data.retweeted_status.extended_entities.media[index].media_url;
                                var dir = "images/" + tweet.id_str + index + ".png";
                                var path = 'disk:/Crospr/' + tweet.id_str + index + ".png";
                                robarTw(i, dir);
                                uploadTw(i, path);
                                index++
                            }
                        } else {
                            console.log("El tweet no tiene imagenes");
                        }
                    });
                } catch (e) {
                    console.log(e);
                }

            } else {
                try {
                    let index = 0;
                    for (var i of tweet.extended_entities.media) {
                        var dir = "images/" + tweet.id_str + index + ".png";
                        var i = tweet.extended_entities.media[index].media_url;
                        var path = 'disk:/Crospr/' + tweet.id_str + index + ".png";
                        robarTw(i, dir);
                        uploadTw(i, path);
                        index++
                    }
                } catch (error) {
                    console.log(e);
                }
            }
        })
    }
}

function uploadTw(url, path) {
    disk.upload.remoteFile(YANDEX_TOKEN, url, path);
    console.log("> Han subido\n------------------------\n");
}

function robarTw(url, filename) {
    request(url).pipe(fs.createWriteStream(filename));
    console.log("> Han robado")
};