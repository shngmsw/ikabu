const { disableLimit } = require('../feat-utils/voice/voice_locker');
const { autokill } = require('../feat-utils/voice/tts/discordjs_voice');
const log4js = require('log4js');

module.exports = {
    call: call,
};

log4js.configure(process.env.LOG4JS_CONFIG_PATH);
const logger = log4js.getLogger('voiceStateUpdate');

async function call(oldState, newState) {
    try {
        if (oldState.channelId === newState.channelId) {
            // ここはミュートなどの動作を行ったときに発火する場所
        } else if (oldState.channelId === null && newState.channelId != null) {
            // ここはconnectしたときに発火する場所
            deleteLimitPermission(newState);
        } else if (oldState.channelId != null && newState.channelId === null) {
            // ここはdisconnectしたときに発火する場所
            disableLimit(oldState);
            autokill(oldState);
        } else {
            // ここはチャンネル移動を行ったときに発火する場所
            deleteLimitPermission(newState);
            disableLimit(oldState);
            autokill(oldState);
        }
    } catch (error) {
        logger.error(error);
    }
}

// 募集時のVCロックの解除
async function deleteLimitPermission(newState) {
    const newChannel = await newState.guild.channels.fetch(newState.channelId);
    if (newChannel.members.size != 0) {
        newChannel.permissionOverwrites.delete(newState.guild.roles.everyone, 'UnLock Voice Channel');
        newChannel.permissionOverwrites.delete(newState.member, 'UnLock Voice Channel');
    }
}
