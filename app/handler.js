const handleBan = require("./ban.js");
const handleBuki = require("./buki.js");
const handleFriendCode = require("./friendcode.js");
const handleSpecial = require("./special.js");
const handleHelp = require("./help.js");
const handleKansen = require("./kansen.js");
const handlePick = require("./pick.js");
const handleOmikuji = require("./omikuji.js");
const handlePoll = require("./poll.js");
const handleRecruit = require("./recruit.js");
const handleRule = require("./rule.js");
const handleShow = require("./show.js");
const handleStageInfo = require("./stageinfo.js");
const handleSub = require("./sub.js");
const handleTimer = require("./timer.js");
const handleVoicePick = require("./vpick.js");
const handleWiki = require("./wiki.js");
const handleRandomMatching = require("./random-matching.js");

module.exports = {
  call: call
};

function call(msg) {
  var strCmd = msg.content.replace(/　/g, " ");
  const args = strCmd.split(" ");
  const command = args.shift().toLowerCase();

  switch (command) {
    case "wiki":
      handleWiki(msg, args[0]);
      break;
    case "kansen":
      handleKansen(msg, args[0]);
      break;
    case "timer":
      handleTimer(msg, args[0]);
      break;
    case "pick":
      handlePick(msg);
      break;
    case "omikuji":
      handleOmikuji(msg);
      break;
    case "vpick":
      handleVoicePick(msg);
      break;
    case "poll":
      handlePoll(msg);
      break;
    case "rule":
      handleRule(msg);
      break;
    case "sub":
      handleSub(msg);
      break;
    case "special":
      handleSpecial(msg);
      break;
    case "buki":
    case "weapon":
      handleBuki(command, msg);
      break;
    case "fes":
    case "now":
    case "nou":
    case "next":
    case "run":
    case "nawabari":
    case "!mhr":
    case "!apex":
    case "!dbd":
      handleRecruit(msg);
      break;
    case "show":
      handleShow(msg, args[0]);
      break;
    case "help":
      handleHelp(msg);
      break;
    case "!ban":
      handleBan(msg);
      break;
    case "fc":
    case "fcadd":
      handleFriendCode(msg);
      break;
    case "stage":
      handleStageInfo(msg);
      break;
    case "randommatch":
      handleRandomMatching(msg);
      break;
  }
}