import { BaseGuildTextChannel, ButtonInteraction, ChannelType, EmbedBuilder } from 'discord.js';
import { RecruitService } from '../../../../db/recruit_service.js';
import { log4js_obj } from '../../../../log4js_settings.js';
import { disableThinkingButton, recoveryThinkingButton, setButtonDisable } from '../../../common/button_components.js';
import { searchChannelById } from '../../../common/manager/channel_manager.js';
import { searchAPIMemberById, searchDBMemberById } from '../../../common/manager/member_manager.js';
import { assertExistCheck, createMentionsFromIdList, isNotEmpty, sleep } from '../../../common/others.js';
import { sendRecruitButtonLog } from '../../../logs/buttons/recruit_button_log.js';
import { channelLinkButtons, messageLinkButtons } from '../../buttons/create_recruit_buttons.js';
import { Participant } from '../../../../db/model/participant.js';
import { ParticipantService } from '../../../../db/participants_service.js';
import { memberListMessage } from './other_events.js';
import { RecruitOpCode, regenerateCanvas } from '../../canvases/regenerate_canvas.js';
import { availableRecruitString, sendStickyMessage } from '../../sticky/recruit_sticky_messages.js';

const logger = log4js_obj.getLogger('recruitButton');

export async function join(interaction: ButtonInteraction, params: URLSearchParams) {
    if (!interaction.inGuild()) return;
    try {
        await interaction.update({
            components: await setButtonDisable(interaction.message, interaction),
        });

        assertExistCheck(interaction.guild, 'guild');
        assertExistCheck(interaction.channel, 'channel');

        const guild = await interaction.guild.fetch();
        const channelId = params.get('vid');
        const image1MsgId = params.get('imid1');
        assertExistCheck(image1MsgId, "params.get('imid1')");

        // interaction.member.user.idでなければならない。なぜならば、APIInteractionGuildMemberはid を直接持たないからである。
        const member = await searchDBMemberById(guild, interaction.member.user.id);

        const recruitData = await RecruitService.getRecruit(guild.id, image1MsgId);

        if (recruitData.length === 0) {
            await interaction.editReply({ components: await disableThinkingButton(interaction, '参加') });
            await interaction.followUp({
                content: '募集データが存在しないでし！',
                ephemeral: false,
            });
            return;
        }

        const participantsData = await ParticipantService.getAllParticipants(guild.id, image1MsgId);

        let recruiter = participantsData[0]; // 募集者
        const recruiterId = recruitData[0].authorId;
        const attendeeList: Participant[] = []; // 募集時参加確定者リスト
        const applicantList: Participant[] = []; // 参加希望者リスト
        for (const participant of participantsData) {
            if (participant.userType === 0) {
                recruiter = participant;
            } else if (participant.userType === 1) {
                attendeeList.push(participant);
            } else {
                applicantList.push(participant);
            }
        }

        // 募集者と募集時参加確定者のIDリスト
        const confirmedMemberIDList = [];
        confirmedMemberIDList.push(recruiterId);
        for (const attendee of attendeeList) {
            confirmedMemberIDList.push(attendee.userId);
        }

        //  参加希望者のIDリスト
        const applicantIdList = [];
        for (const applicant of applicantList) {
            applicantIdList.push(applicant.userId);
        }

        sendRecruitButtonLog(interaction, member, recruiter, '参加', '#5865f2');

        if (confirmedMemberIDList.includes(member.userId)) {
            await interaction.followUp({
                content: '募集メンバーは参加表明できないでし！',
                ephemeral: true,
            });

            await interaction.editReply({
                content: await memberListMessage(interaction, image1MsgId),
                components: await recoveryThinkingButton(interaction, '参加'),
            });
            return;
        } else {
            // 参加済みかチェック
            if (applicantIdList.includes(member.userId)) {
                await interaction.followUp({
                    content: '既に参加ボタンを押してるでし！',
                    ephemeral: true,
                });

                await interaction.editReply({
                    components: await recoveryThinkingButton(interaction, '参加'),
                });
                return;
            }

            const embed = new EmbedBuilder();
            embed.setAuthor({
                name: `${member.displayName}たんが参加表明したでし！`,
                iconURL: member.iconUrl,
            });

            // recruitテーブルにデータ追加
            await ParticipantService.registerParticipant(image1MsgId, member.userId, 2, new Date());

            const recruitChannel = interaction.channel;

            // ホストがVCにいるかチェックして、VCにいる場合はText in Voiceにメッセージ送信
            let notifyMessage = null;
            const recruiterGuildMember = await searchAPIMemberById(guild, recruiterId);
            try {
                if (isNotEmpty(recruiterGuildMember.voice.channel) && recruiterGuildMember.voice.channel.type === ChannelType.GuildVoice) {
                    const hostJoinedVC = await searchChannelById(guild, recruiterGuildMember.voice.channelId);

                    await hostJoinedVC.send({
                        embeds: [embed],
                        components: [messageLinkButtons(interaction.guildId, recruitChannel.id, interaction.message.id)],
                    });
                }
            } catch (error) {
                logger.error(error);
            }

            await regenerateCanvas(guild, recruitChannel.id, image1MsgId, RecruitOpCode.open);

            notifyMessage = await interaction.message.reply({
                content: createMentionsFromIdList(confirmedMemberIDList).join(' '),
                embeds: [embed],
            });

            if (recruitChannel instanceof BaseGuildTextChannel) {
                const content = await availableRecruitString(guild, recruitChannel.id, recruitData[0].recruitType);
                await sendStickyMessage(guild, recruitChannel.id, content);
            }

            if (channelId === null) {
                await interaction.followUp({
                    content: `<@${recruiterId}>からの返答を待つでし！\n条件を満たさない場合は参加を断られる場合があるでし！`,
                    // components: [channelLinkButtons(interaction.guildId, thread_message.url)], TODO: スレッド内へのリンクボタンを作る
                    ephemeral: true,
                });
            } else {
                await interaction.followUp({
                    content: `<@${recruiterId}>からの返答を待つでし！\n条件を満たさない場合は参加を断られる場合があるでし！`,
                    components: [channelLinkButtons(guild.id, channelId)],
                    ephemeral: true,
                });
            }

            await interaction.editReply({
                content: await memberListMessage(interaction, image1MsgId),
                components: await recoveryThinkingButton(interaction, '参加'),
            });

            // 5分後にホストへの通知を削除
            if (notifyMessage !== null) {
                await sleep(300);
                try {
                    notifyMessage.delete();
                } catch (error) {
                    logger.warn('notify message has been already deleted');
                }
            }
        }
    } catch (err) {
        logger.error(err);
        await interaction.editReply({
            components: await disableThinkingButton(interaction, '参加'),
        });
        interaction.channel?.send('なんかエラー出てるわ');
    }
}
