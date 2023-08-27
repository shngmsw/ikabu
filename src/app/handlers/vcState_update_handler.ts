import { VoiceState } from 'discord.js';

import { log4js_obj } from '../../log4js_settings';
import { exists, notExists } from '../common/others';
import { vcToolsStickyFromVoiceState } from '../event/vctools_sticky/vc_tools_message';
import { disableLimit } from '../event/vctools_sticky/voice_lock';
import { autokill } from '../feat-utils/voice/tts/discordjs_voice';

const logger = log4js_obj.getLogger('voiceStateUpdate');

export async function call(oldState: VoiceState, newState: VoiceState) {
    try {
        if (oldState.channelId === newState.channelId) {
            // ここはミュートなどの動作を行ったときに発火する場所
        } else if (notExists(oldState.channelId) && exists(newState.channelId)) {
            // ここはconnectしたときに発火する場所
            await deleteLimitPermission(newState);
            await vcToolsStickyFromVoiceState(newState, true);
        } else if (exists(oldState.channelId) && notExists(newState.channelId)) {
            // ここはdisconnectしたときに発火する場所
            await disableLimit(oldState); // vcToolsStickyよりも先に実行しないと人数が反映されない
            await vcToolsStickyFromVoiceState(oldState, false);
            await autokill(oldState);
        } else {
            // ここはチャンネル移動を行ったときに発火する場所
            await disableLimit(oldState); // vcToolsStickyよりも先に実行しないと人数が反映されない
            await vcToolsStickyFromVoiceState(newState, true);
            await vcToolsStickyFromVoiceState(oldState, false);
            await deleteLimitPermission(newState);
            await autokill(oldState);
        }
    } catch (error) {
        logger.error(error);
    }
}

// 募集時のVCロックの解除
async function deleteLimitPermission(newState: VoiceState) {
    newState.channel;
    if (exists(newState.channelId)) {
        const newChannel = await newState.guild.channels.fetch(newState.channelId);
        if (exists(newChannel) && newChannel.isVoiceBased()) {
            if (newChannel.members.size !== 0 && exists(newState.member)) {
                await newChannel.permissionOverwrites.delete(
                    newState.guild.roles.everyone,
                    'UnLock Voice Channel',
                );
                await newChannel.permissionOverwrites.delete(
                    newState.member,
                    'UnLock Voice Channel',
                );
            }
        }
    }
}
