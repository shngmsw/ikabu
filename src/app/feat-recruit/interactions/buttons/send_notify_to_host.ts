import { Member } from '@prisma/client';
import {
    ActionRowBuilder,
    AnyThreadChannel,
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
import { exists } from '../../../common/others';
import { sendErrorLogs } from '../../../logs/error/send_error_logs';
import { joinRequestConfirmButtons } from '../../buttons/create_join_request_buttons';
import { messageLinkButtons } from '../../buttons/create_recruit_buttons';

const logger = log4js_obj.getLogger('recruitButton');

export async function sendJoinNotifyToHost(
    message: Message<true>,
    recruitId: string,
    guild: Guild,
    recruitChannel: TextBasedChannel,
    member: Member,
    recruiter: ParticipantMember,
    attendeeList: ParticipantMember[],
) {
    let threadChannel = null;
    if (!recruitChannel.isThread()) {
        threadChannel =
            message.thread ??
            (await message.startThread({
                name: recruiter.member.displayName + 'たんの募集',
            }));

        // 参加者がスレッドにいない場合は追加
        await threadChannel.members.add(member.userId);
    }

    const text = `${member.displayName}たんが参加表明したでし！`;
    void sendNotifyToHost(
        message,
        text,
        'Blurple',
        guild,
        recruitChannel,
        threadChannel,
        member,
        recruiter,
        attendeeList,
        [joinRequestConfirmButtons(recruitId, message.id, member.userId)],
    );
}

export async function sendCancelNotifyToHost(
    message: Message<true>,
    guild: Guild,
    recruitChannel: TextBasedChannel,
    member: Member,
    recruiter: ParticipantMember,
    attendeeList: ParticipantMember[],
) {
    let threadChannel = null;
    if (!recruitChannel.isThread()) {
        threadChannel =
            message.thread ??
            (await message.startThread({
                name: recruiter.member.displayName + 'たんの募集',
            }));

        // 参加者がスレッドにいる場合は削除
        await threadChannel.members.remove(member.userId);
    }

    const text = `${member.displayName}たんがキャンセルしたでし！`;
    void sendNotifyToHost(
        message,
        text,
        'Red',
        guild,
        recruitChannel,
        threadChannel,
        member,
        recruiter,
        attendeeList,
        [],
    );
}

async function sendNotifyToHost(
    message: Message<true>,
    text: string,
    embedColor: ColorResolvable,
    guild: Guild,
    recruitChannel: TextBasedChannel,
    threadChannel: AnyThreadChannel | null,
    member: Member,
    recruiter: ParticipantMember,
    attendeeList: ParticipantMember[],
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

        let mentions = recruiter.member.mention;
        for (const attendee of attendeeList) {
            mentions += ` ${attendee.member.mention}`;
        }

        if (exists(threadChannel)) {
            await threadChannel.send({
                content: mentions,
                embeds: [embed],
                components: buttons,
            });
        } else {
            await recruitChannel.send({
                content: mentions,
                embeds: [embed],
                components: buttons,
            });
        }
    } catch (error) {
        await sendErrorLogs(logger, error);
    }
}
