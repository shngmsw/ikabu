import { ButtonInteraction } from 'discord.js';
import { RecruitService } from '../../../../db/recruit_service.js';
import { log4js_obj } from '../../../../log4js_settings.js';
import { setButtonDisable } from '../../../common/button_components';
import { searchDBMemberById } from '../../../common/manager/member_manager.js';
import { searchMessageById } from '../../../common/manager/message_manager.js';
import { isNotEmpty } from '../../../common/others.js';
import { sendRecruitButtonLog } from '../.././../logs/buttons/recruit_button_log';
import { Participant } from '../../../../db/model/participant.js';
import { ParticipantService } from '../../../../db/participants_service.js';

const logger = log4js_obj.getLogger('recruitButton');

export async function del(interaction: ButtonInteraction, params: URLSearchParams) {
    /** @type {Discord.Snowflake} */
    try {
        // 処理待ち
        await interaction.deferReply({
            ephemeral: true,
        });

        const guild = await interaction.guild?.fetch();
        if (guild === undefined) {
            throw new Error('guild cannot fetch.');
        }
        if (interaction.member === null) {
            throw new Error('interaction.member is null');
        }
        const member = await searchDBMemberById(guild, interaction.member.user.id);
        const buttonMessageId = params.get('mid');
        const buttonMessage = await searchMessageById(guild, interaction.channelId, buttonMessageId);
        const image1MsgId = params.get('imid1');
        if (image1MsgId === null) {
            throw new Error('image1 message id is null.');
        }
        const image1Message = await searchMessageById(guild, interaction.channelId, image1MsgId);
        const image2MsgId = params.get('imid2');
        let image2Message;
        if (isNotEmpty(image2MsgId)) {
            image2Message = await searchMessageById(guild, interaction.channelId, image2MsgId);
        }

        const participantsData = await ParticipantService.getAllParticipants(guild.id, image1MsgId);

        let recruiter = participantsData[0]; // 募集者
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
        confirmedMemberIDList.push(recruiter.userId);
        for (const attendee of attendeeList) {
            confirmedMemberIDList.push(attendee.userId);
        }

        sendRecruitButtonLog(interaction, member, recruiter, '削除', '#f04747');

        if (confirmedMemberIDList.includes(member.userId)) {
            try {
                await interaction.message.delete();
            } catch (error) {
                logger.warn('recruit delete button has already been deleted');
            }

            try {
                await image1Message.delete();
            } catch (error) {
                logger.warn('recruit message or recruit image has already been deleted');
            }

            try {
                await image2Message.delete();
            } catch (error) {
                logger.warn('rule image is either not set or has already been deleted.');
            }

            try {
                await buttonMessage.delete();
            } catch (error) {
                logger.warn('recruit components has already been deleted');
            }

            // recruitテーブルから削除
            await RecruitService.deleteRecruit(image1MsgId);

            // participantsテーブルから該当募集のメンバー全員削除
            await ParticipantService.deleteAllParticipant(image1MsgId);

            await interaction.editReply({
                content: '募集を削除したでし！\n次回は内容をしっかり確認してから送信するでし！',
            });
        } else {
            await interaction.editReply({
                content: '他人の募集は消せる訳無いでし！！！',
            });
        }
    } catch (err) {
        logger.error(err);
        interaction.message.edit({
            components: await setButtonDisable(interaction.message),
        });
        interaction.channel?.send('なんかエラー出てるわ');
    }
}