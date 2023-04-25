const { TwitterApi } = require("twitter-api-v2");
const { TWITTER_BEARER_TOKEN } = require("../../config.json");

const client = new TwitterApi(TWITTER_BEARER_TOKEN);

const rwClient = client.readWrite;

module.exports = rwClient;