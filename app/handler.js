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
    const { options } = interaction;

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
        case commandNames.pick:
            handlePick(interaction);
            break;
        case commandNames.voice_pick:
            handleVoicePick(interaction);
            break;
        case commandNames.buki:
            handleBuki(interaction);
            break;
        case commandNames.show:
            handleShow(interaction);
            break;
        case commandNames.help:
            handleHelp(interaction);
            break;
        case commandNames.ban:
            handleBan(interaction);
            break;
        case commandNames.ch_manager:
            const subCommand = options.getSubcommand();
            switch (subCommand) {
                case 'チャンネル作成':
                    handleCreateRoom(interaction);
                    break;
                case 'ロール作成':
                    handleCreateRole(interaction);
                    break;
                case 'カテゴリー削除':
                    handleDeleteCategory(interaction);
                    break;
                case 'チャンネル削除':
                    handleDeleteChannel(interaction);
                    break;
                case 'ロール削除':
                    handleDeleteRole(interaction);
                    break;
            }
    }
}
