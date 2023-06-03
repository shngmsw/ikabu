import { log4js_obj } from '../../log4js_settings';
import { exists, notExists } from '../common/others';
import { autokill } from '../feat-utils/voice/tts/discordjs_voice';
import { disableLimit } from '../feat-utils/voice/voice_locker';

const logger = log4js_obj.getLogger('voiceStateUpdate');

export async function call(oldState: $TSFixMe, newState: $TSFixMe) {
    try {
        if (oldState.channelId === newState.channelId) {
            // ここはミュートなどの動作を行ったときに発火する場所
        } else if (notExists(oldState.channelId) && exists(newState.channelId)) {
            // ここはconnectしたときに発火する場所
            deleteLimitPermission(newState);
        } else if (exists(oldState.channelId) && notExists(newState.channelId)) {
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
