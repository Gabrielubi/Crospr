const streamClient = require("./twitterClient");
const { ETwitterStreamEvent } = require("twitter-api-v2");
const { TWITTER_USER_ID, DISCORD_CHANNEL_ID } = require("../../config.json");
const { mainScrapper } = require ("./twitterScrapper");

async function discordMessage(tweet_id, bot) {
  let tweets = await streamClient.v1.singleTweet(tweet_id);

  let timestamp = Date.now();
  let OriginalTweetUser = tweets.user.screen_name;
  let OriginalTweetID = tweets.id_str;

  let twitterMessage = `https://twitter.com/${OriginalTweetUser}/status/${OriginalTweetID}`;
  for (let counter = 0; counter < DISCORD_CHANNEL_ID.length; counter++) {
    bot.channels.cache.get(DISCORD_CHANNEL_ID[counter]).send(twitterMessage);
  }
  console.log(
    `-------New tweet!-------\n> ${new Date(timestamp).toLocaleTimeString()}`
  );
}

module.exports = {
  startStream: async function (getBot) {
    let bot = getBot;
    // Get and delete old rules if needed
    const rules = await streamClient.v2.streamRules();
    if (rules.data?.length) {
      await streamClient.v2.updateStreamRules({
        delete: { ids: rules.data.map((rule) => rule.id) },
      });
      console.log("Stream rules cleared");
    }
    // Add custom rules

    await streamClient.v2.updateStreamRules({
      add: [{ value: `from:${TWITTER_USER_ID}` }],
    });
    console.log("Stream rules added\nlock'nLoaded" );

    // ??? This should filter the payload ???
    const stream = await streamClient.v2.searchStream({
      expansions: ["referenced_tweets.id"],
    });
    // Enable auto reconnect
    stream.autoReconnect = true;

    stream.on(ETwitterStreamEvent.Connected, () =>
      console.log("Stream conectced")
    );

    stream.on(ETwitterStreamEvent.Data, async (tweet) => {
      tweet_id = tweet.data.referenced_tweets[0].id;
      discordMessage(tweet_id, bot);
      mainScrapper(tweet_id); // should shift to the v2 api

    });
  },
};
