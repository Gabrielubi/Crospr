const client = require("./twitterClient");
const disk = require("ya-disk");
const fs = require("fs");
const request = require("request");
const { YANDEX_TOKEN } = require("../../config.json");

module.exports = {
  mainScrapper: async function (id_str) {
    let tweet = await client.v1.singleTweet(id_str);

    if (tweet.extended_entities !== undefined) {
      switch (tweet.extended_entities.media[0].type) {
        case "video":
          handleTwVideo(tweet.extended_entities, id_str);
          break;
        case "animated_gif":
          handleTwAnimatedGif(tweet.extended_entities, id_str);
          break;
        case "photo":
          handleTwImage(tweet.extended_entities, id_str);
          break;
        default:
          console.log("...");
          break;
      }
    } else {
      console.log("The tweet doesn't have images");
    }

    return console.log("Scrapin'")
  },
};

//cloud storage upload
function uploadTw(url, path) {
  disk.upload.remoteFile(YANDEX_TOKEN, url, path);
  console.log("> Uploaded to cloud\n------------------------\n");
}

//keeps the tweet media content in the local folder
function catchTw(url, filename) {
  request(url).pipe(fs.createWriteStream(filename));
  console.log("> Downloaded to local files");
}

//handlers sorted by type of media
function handleTwVideo(tweet, id_str) {
  let bitrate = 0;
  let video_url;
  for (let j = 0; j < tweet.media[0].video_info.variants.length; j++) {
    if (tweet.media[0].video_info.variants[j].bitrate) {
      if (tweet.media[0].video_info.variants[j].bitrate > bitrate) {
        bitrate = tweet.media[0].video_info.variants[j].bitrate;
        video_url = tweet.media[0].video_info.variants[j].url;
      }
    }
  }
  let i = video_url;
  let dir = "media/video/" + id_str + ".mp4";
  let path = "disk:/Crospr/video" + id_str + ".mp4";
  catchTw(i, dir);
  uploadTw(i, path);
  //iterator? maybe
}

function handleTwAnimatedGif(tweet, id_str) {
  let video_url = tweet.media[0].video_info.variants[0].url;
  let i = video_url;
  let dir = "media/animated_gif/" + id_str + ".mp4"; //tweet.data.id_str + ".mp4";??????????????
  let path = "disk:/Crospr/video" + id_str + ".mp4";
  catchTw(i, dir);
  uploadTw(i, path);
  //atm Twitter only admits one gif per tweet - 01 - 
}

function handleTwImage(tweet, id_str) {
  let index = 0;
  for (var j of tweet.media) {
    let i = tweet.media[index].media_url;
    let dir = "media/images/" + id_str + index + ".png";
    let path = "disk:/Crospr/" + id_str + index + ".png";
    catchTw(i, dir);
    uploadTw(i, path);
    index++;
  }
}
