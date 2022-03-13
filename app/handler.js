const handleBan = require('./cmd/admin-cmd/ban.js');
const handleBuki = require('./cmd/buki.js');
const handleFriendCode = require('./cmd/friendcode.js');
const handleSpecial = require('./cmd/special.js');
const handleHelp = require('./cmd/help.js');
const handleKansen = require('./cmd/kansen.js');
const handlePick = require('./cmd/pick.js');
const handleOmikuji = require('./cmd/omikuji.js');
const handlePoll = require('./cmd/poll.js');
const handleRecruit = require('./cmd/recruit.js');
const handleRule = require('./cmd/rule.js');
const handleShow = require('./cmd/show.js');
const handleStageInfo = require('./cmd/stageinfo.js');
const handleSub = require('./cmd/sub.js');
const handleTimer = require('./cmd/timer.js');
const handleVoicePick = require('./cmd/vpick.js');
const handleWiki = require('./cmd/wiki.js');
const { handleCreateRole } = require('./cmd/admin-cmd/manageRole.js');
const handleDeleteCategory = require('./cmd/admin-cmd/deleteCategory.js');
const handleDeleteChannel = require('./cmd/admin-cmd/deleteChannel.js');
const handleCreateRoom = require('./cmd/admin-cmd/createRoom.js');

module.exports = {
    call: call,
};

function call(msg) {
    var strCmd = msg.content.replace(/　/g, ' ');
    const args = strCmd.split(' ');
    const command = args.shift().toLowerCase();

    switch (command) {
        case 'wiki':
            handleWiki(msg, args[0]);
            break;
        case 'kansen':
            handleKansen(msg, args[0]);
            break;
        case 'timer':
            handleTimer(msg, args[0]);
            break;
        case 'pick':
            handlePick(msg);
            break;
        case 'omikuji':
            handleOmikuji(msg);
            break;
        case 'vpick':
            handleVoicePick(msg);
            break;
        case 'poll':
            handlePoll(msg);
            break;
        case 'rule':
            handleRule(msg);
            break;
        case 'sub':
            handleSub(msg);
            break;
        case 'special':
            handleSpecial(msg);
            break;
        case 'buki':
        case 'weapon':
            handleBuki(command, msg);
            break;
        case 'now':
        case 'nou':
        case 'next':
        case 'run':
        case 'nawabari':
        case '!mhr':
        case '!apex':
        case '!dbd':
            handleRecruit(msg);
            break;
        case 'show':
            handleShow(msg, args[0]);
            break;
        case 'help':
            handleHelp(msg);
            break;
        case '!ban':
            handleBan(msg);
            break;
        case 'fc':
        case 'fcadd':
            handleFriendCode(msg);
            break;
        case 'stage':
            handleStageInfo(msg);
            break;
        case '!createroom':
            handleCreateRoom(msg);
            break;
        case '!createrole':
            handleCreateRole(msg);
            break;
        case '!deletecategory':
            handleDeleteCategory(msg);
            break;
        case '!deletechannel':
            handleDeleteChannel(msg);
            break;
    }
}
