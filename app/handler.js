const root = require('app-root-path');

const handleBan = require('./cmd/admin-cmd/ban.js');
const handleBuki = require('./cmd/splat2/buki.js');
const handleHelp = require('./cmd/other/help.js');
const handleKansen = require('./cmd/other/kansen.js');
const handlePick = require('./cmd/other/pick.js');
const handleShow = require('./cmd/splat2/show.js');
const handleTimer = require('./cmd/other/timer.js');
const handleVoicePick = require('./cmd/other/vpick.js');
const handleWiki = require('./cmd/other/wiki.js');
const { handleCreateRole, handleDeleteRole } = require('./cmd/admin-cmd/manageRole.js');
const handleDeleteCategory = require('./cmd/admin-cmd/deleteCategory.js');
const handleDeleteChannel = require('./cmd/admin-cmd/deleteChannel.js');
const handleCreateRoom = require('./cmd/admin-cmd/createRoom.js');
const { commandNames } = require(root + '/constant.js');

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
