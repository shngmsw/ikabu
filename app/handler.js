const handleBan = require('./cmd/admin-cmd/ban.js');
const handleBuki = require('./cmd/buki.js');

const handleHelp = require('./cmd/help.js');
const handleKansen = require('./cmd/kansen.js');
const handlePick = require('./cmd/pick.js');
const handleOmikuji = require('./cmd/omikuji.js');
const handlePoll = require('./cmd/poll.js');
const handleShow = require('./cmd/show.js');
const handleStageInfo = require('./cmd/stageinfo.js');
const handleTimer = require('./cmd/timer.js');
const handleVoicePick = require('./cmd/vpick.js');
const handleWiki = require('./cmd/wiki.js');
const { handleCreateRole, handleDeleteRole } = require('./cmd/admin-cmd/manageRole.js');
const handleDeleteCategory = require('./cmd/admin-cmd/deleteCategory.js');
const handleDeleteChannel = require('./cmd/admin-cmd/deleteChannel.js');
const handleCreateRoom = require('./cmd/admin-cmd/createRoom.js');
const { commandNames } = require('../constant.js');

module.exports = {
    call: call,
};

function call(interaction) {
    const { commandName } = interaction;

    switch (commandName) {
        case commandNames.wiki:
            handleWiki(interaction);
            break;
        case commandNames.kansen:
            handleKansen(interaction);
            break;
        case commandNames.timer:
            handleTimer(interaction);
            break;
        case 'pick':
            handlePick(interaction);
            break;
        case 'omikuji':
            handleOmikuji(interaction);
            break;
        case 'vpick':
            handleVoicePick(interaction);
            break;
        case 'poll':
            handlePoll(interaction);
            break;
        case 'buki':
        case 'weapon':
            handleBuki(interaction);
            break;
        case 'show':
            handleShow(interaction);
            break;
        case 'help':
            handleHelp(interaction);
            break;
        case '!ban':
            handleBan(interaction);
            break;
        case 'stage':
            handleStageInfo(interaction);
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
        case '!deleterole':
            handleDeleteRole(msg);
            break;
    }
}
