import { Member } from '@prisma/client';
import {
    ActionRowBuilder,
    ButtonBuilder,
    ChannelType,
    ColorResolvable,
    EmbedBuilder,
    Guild,
    GuildBasedChannel,
    Message,
    TextBasedChannel,
} from 'discord.js';

import { ParticipantMember } from '../../../../db/participant_service';
import { log4js_obj } from '../../../../log4js_settings';
import { searchChannelById } from '../../../common/manager/channel_manager';
import { searchAPIMemberById } from '../../../common/manager/member_manager';
import { searchMessageById } from '../../../common/manager/message_manager';
import { createMentionsFromIdList, exists, sleep } from '../../../common/others';
import { sendErrorLogs } from '../../../logs/error/send_error_logs';
import { joinRequestConfirmButtons } from '../../buttons/create_join_request_buttons';
import { messageLinkButtons } from '../../buttons/create_recruit_buttons';

const logger = log4js_obj.getLogger('recruitButton');

export function sendJoinNotifyToHost(
    message: Message<true>,
    recruitId: string,
    guild: Guild,
    recruitChannel: TextBasedChannel,
    member: Member,
    recruiter: ParticipantMember,
    confirmedMemberIDList: string[],
) {
    const text = `${member.displayName}たんが参加表明したでし！`;
    void sendNotifyToHost(
        message,
        text,
        'Blurple',
        guild,
        recruitChannel,
        member,
        recruiter,
        confirmedMemberIDList,
        [joinRequestConfirmButtons(recruitId, message.id, member.userId)],
    );
}

export function sendCancelNotifyToHost(
    message: Message<true>,
    guild: Guild,
    recruitChannel: TextBasedChannel,
    member: Member,
    recruiter: ParticipantMember,
    confirmedMemberIDList: string[],
) {
    const text = `${member.displayName}たんがキャンセルしたでし！`;
    void sendNotifyToHost(
        message,
        text,
        'Red',
        guild,
        recruitChannel,
        member,
        recruiter,
        confirmedMemberIDList,
        [],
    );
}

async function sendNotifyToHost(
    message: Message<true>,
    text: string,
    embedColor: ColorResolvable,
    guild: Guild,
    recruitChannel: TextBasedChannel,
    member: Member,
    recruiter: ParticipantMember,
    confirmedMemberIDList: string[],
    buttons: ActionRowBuilder<ButtonBuilder>[],
) {
    try {
        const embed = new EmbedBuilder();
        embed.setAuthor({
            name: text,
            iconURL: member.iconUrl,
        });
        embed.setColor(embedColor);

        // ホストがVCにいるかチェックして、VCにいる場合はText in Voiceにメッセージ送信
        const recruiterGuildMember = await searchAPIMemberById(guild, recruiter.userId);

        let hostJoinedVC: GuildBasedChannel | null = null;

        if (
            exists(recruiterGuildMember) &&
            exists(recruiterGuildMember.voice.channel) &&
            recruiterGuildMember.voice.channel.type === ChannelType.GuildVoice
        ) {
            hostJoinedVC = await searchChannelById(guild, recruiterGuildMember.voice.channel.id);

            if (exists(hostJoinedVC) && hostJoinedVC.isTextBased()) {
                await hostJoinedVC.send({
                    embeds: [embed],
                    components: [messageLinkButtons(guild.id, recruitChannel.id, message.id)],
                });
            }
        }

        const notifyMessage = await message.reply({
            content: createMentionsFromIdList(confirmedMemberIDList).join(' '),
            embeds: [embed],
            components: buttons,
        });

        await sleep(1800);
        // 30分後に承認/拒否ボタンを削除
        const checkNotifyMessage = await searchMessageById(
            guild,
            recruitChannel.id,
            notifyMessage.id,
        );
        if (exists(checkNotifyMessage)) {
            try {
                await checkNotifyMessage.edit({ components: [] });
            } catch (error) {
                logger.warn('notify message was not found.');
            }
        }
    } catch (error) {
        await sendErrorLogs(logger, error);
    }
}
