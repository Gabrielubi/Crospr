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

        //imagen 1459754937450057731    type photo
        //gif  1454225217539223560      type animated_gif
        //vidio 1483352525738708992     type video

        //  follow:[] can be an array of users ID.
        let stream = T.stream('statuses/filter', { follow: [TWITTER_USER_ID], tweet_mode: 'extended' })
        const dest = DISCORD_CHANNEL_ID;



        try {
            stream.on('tweet', function (tweet) {
                //For some reason a retweeted message counts as a tweet. The 'tweet ID' is the only thing that really matters
                const twitterMessage = `https://twitter.com/Crospr/status/${tweet.id_str}`;
                bot.channels.cache.get(dest).send(twitterMessage);
                let timestamp = Date.now();
                console.log(`-------New tweet!-------\n> ${new Date(timestamp).toLocaleTimeString()}`);

                T.get('statuses/show/:id', { id: tweet.id_str, tweet_mode: 'extended' }, function (err, data, response) {
                    if (data.extended_entities !== undefined) {
                        switch (data.extended_entities.media[0].type) {
                            case "video":
                                handleTwVideo(data)
                                break;
                            case "animated_gif":
                                handleTwAnimatedGif(data)
                                break;
                            case "photo": 
                                handleTwImage(data);
                                break;
                            default:
                                console.log("Can't break it down");
                                break;
                        }
                    } else {
                        console.log("The tweet doesn't have images");
                    }
                });
            })
        } catch (e) {
            console.log("Here is the error : " + e);
        }

        stream.on('error', (e) => {
            console.log(`${e}\nrestart in 40 seconds...`);
            //to do
        })

        stream.on('uncaughtException', (e) => {
            console.log(`Exception : ${e}\nrestart in 40 seconds...`);
            //to do
        })
    }
}

function uploadTw(url, path) {
    disk.upload.remoteFile(YANDEX_TOKEN, url, path);
    console.log("> Uploaded to cloud\n------------------------\n");
};

function catchTw(url, filename) {
    request(url).pipe(fs.createWriteStream(filename));
    console.log("> Downloaded to local files")
};

function handleTwVideo(tweet) {
    let bitrate = 0;
    let video_url;
    for (let j = 0; j < tweet.extended_entities.media[0].video_info.variants.length; j++) {
        if (tweet.extended_entities.media[0].video_info.variants[j].bitrate) {
            if (tweet.extended_entities.media[0].video_info.variants[j].bitrate > bitrate) {
                bitrate = tweet.extended_entities.media[0].video_info.variants[j].bitrate;
                video_url = tweet.extended_entities.media[0].video_info.variants[j].url;
            }
        }
    }
    let i = video_url;
    let dir = "media/video/" + tweet.id_str + ".mp4";
    let path = 'disk:/Crospr/video' + tweet.id_str + ".mp4";
    catchTw(i, dir);
    uploadTw(i, path);
    //iterator? maybe
};

function handleTwAnimatedGif(tweet) {
    let video_url = tweet.extended_entities.media[0].video_info.variants[0].url;
    let i = video_url;
    let dir = "media/animated_gif/" + tweet.id_str + ".mp4";
    let path = 'disk:/Crospr/video' + tweet.id_str + ".mp4";
    catchTw(i, dir);
    uploadTw(i, path);
    //iterator? not needed. Twitter only admits one gif per tweet
};

function handleTwImage(tweet) {
    let index = 0;
    for (var j of tweet.retweeted_status.extended_entities.media) {
        let i = tweet.retweeted_status.extended_entities.media[index].media_url;
        let dir = "media/images/" + tweet.id_str + index + ".png";
        let path = 'disk:/Crospr/' + tweet.id_str + index + ".png";
        catchTw(i, dir);
        uploadTw(i, path);
        index++;
    };
}