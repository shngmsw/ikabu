import { disableLimit } from '../feat-utils/voice/voice_locker';
import { autokill } from '../feat-utils/voice/tts/discordjs_voice';
import { log4js_obj } from '../../log4js_settings';

const logger = log4js_obj.getLogger('voiceStateUpdate');

export async function call(oldState: $TSFixMe, newState: $TSFixMe) {
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
async function deleteLimitPermission(newState: $TSFixMe) {
    const newChannel = await newState.guild.channels.fetch(newState.channelId);
    if (newChannel.members.size != 0) {
        newChannel.permissionOverwrites.delete(newState.guild.roles.everyone, 'UnLock Voice Channel');
        newChannel.permissionOverwrites.delete(newState.member, 'UnLock Voice Channel');
    }
}
