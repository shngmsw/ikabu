import { ButtonInteraction } from 'discord.js';

import { sendVCToolsSticky } from './vc_tools_message';
import { log4js_obj } from '../../../log4js_settings';
import { getGuildByInteraction } from '../../common/manager/guild_manager';
import { searchAPIMemberById } from '../../common/manager/member_manager';
import { getDeveloperMention, notExists, sleep } from '../../common/others';
import {
    getVoiceChannelState,
    createVCLEmbed,
    createVCLButton,
} from '../../feat-utils/voice/voice_locker';

const logger = log4js_obj.getLogger('interaction');

export async function showLockPanelFromVCTools(interaction: ButtonInteraction<'cached' | 'raw'>) {
    await interaction.deferReply({ ephemeral: true });
    const channel = interaction.channel;
    const guild = await getGuildByInteraction(interaction);

    if (notExists(channel) || !channel.isVoiceBased()) return;

    const member = await searchAPIMemberById(guild, interaction.user.id);

    if (notExists(member)) {
        return await channel.send(getDeveloperMention + 'メンバー情報が取得できなかったでし！');
    }

    if (member.voice.channelId !== channel.id) {
        return await interaction.editReply({
            content: '対象のボイスチャンネルに接続する必要があるでし！',
        });
    }

    const channelState = await getVoiceChannelState(channel);
    if (notExists(channelState)) return;

    const embed = createVCLEmbed(channelState);
    const button = createVCLButton(channelState);

    const lockPanel = await interaction.editReply({
        embeds: [embed],
        components: [button],
    });

    await sendVCToolsSticky(guild, channel, false);

    await sleep(60);

    try {
        await lockPanel.delete();
    } catch (error) {
        logger.warn('message missing!');
    }
}
