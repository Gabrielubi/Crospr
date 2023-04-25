const { startStream } = require("./twitterModule/twitterStream");

module.exports = {
  name: "twitter", //ready
  execute(bot) {
    try {
      startStream(bot);
    } catch (error) {
      console.log(error);
    }
  }, 
};
;