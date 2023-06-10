import { CacheType, ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';

import { Participant } from '../../../../db/model/participant';
import { RecruitType } from '../../../../db/model/recruit';
import { ParticipantService } from '../../../../db/participants_service';
import { RecruitService } from '../../../../db/recruit_service';
import { log4js_obj } from '../../../../log4js_settings';
import { searchDBMemberById } from '../../../common/manager/member_manager';
import { searchMessageById } from '../../../common/manager/message_manager';
import { assertExistCheck, exists, sleep } from '../../../common/others';
import { embedRecruitDeleteButton, recruitActionRow } from '../../buttons/create_recruit_buttons';
import { sendRecruitSticky } from '../../sticky/recruit_sticky_messages';
import { getMemberMentions } from '../buttons/other_events';

const logger = log4js_obj.getLogger('recruit');

export async function privateRecruit(interaction: ChatInputCommandInteraction<CacheType>) {
    if (!interaction.inGuild()) return;

    const options = interaction.options;
    const startTime = options.getString('開始時刻') ?? 'ERROR';
    const time = options.getString('所要時間') ?? 'ERROR';
    const recruitNumText = options.getString('募集人数') ?? 'ERROR';
    const condition = options.getString('内容または参加条件') ?? 'なし';
    const roomUrl = options.getString('ヘヤタテurl');
    const logo = 'https://cdn.wikimg.net/en/splatoonwiki/images/1/1a/Private-battles-badge%402x.png';

    if (exists(roomUrl) && !isRoomUrl(roomUrl)) {
        return await interaction.reply({ content: `\`${roomUrl}\`はヘヤタテURLではないでし！`, ephemeral: true });
    }

    await interaction.deferReply();

    assertExistCheck(interaction.guild, 'guild');
    assertExistCheck(interaction.channel, 'channel');

    const guild = interaction.guild;
    const recruiter = await searchDBMemberById(guild, interaction.member.user.id);
    const recruitChannel = interaction.channel;

    assertExistCheck(recruiter, 'recruiter');

    const embed = new EmbedBuilder()
        .setAuthor({
            name: recruiter.displayName,
            iconURL: recruiter.iconUrl,
        })
        .setTitle('プライベートマッチ募集')
        .addFields([
            {
                name: '開始時刻',
                value: startTime,
            },
            {
                name: '所要時間',
                value: time,
            },
            {
                name: '募集人数',
                value: recruitNumText,
            },
            {
                name: 'プラベ内容または参加条件',
                value: condition,
            },
            {
                name: 'ヘヤタテURL',
                value: roomUrl !== null ? 'あり\n`※参加ボタンを押すと参加用URLが表示されます。`' : 'なし',
            },
        ])
        .setColor('#5900b7')
        .setTimestamp()
        .setThumbnail(logo);

    try {
        const embedMessage = await interaction.editReply({
            content: `### <@${recruiter.userId}>**たんのプライベート募集**`,
            embeds: [embed],
        });

        let recruitNum = Number(recruitNumText);
        if (isNaN(recruitNum)) {
            recruitNum = -1;
        }

        // DBに募集情報を登録
        await RecruitService.registerRecruit(
            guild.id,
            recruitChannel.id,
            embedMessage.id,
            recruiter.userId,
            recruitNum,
            condition,
            null,
            RecruitType.PrivateRecruit,
            roomUrl,
        );

        // DBに参加者情報を登録
        await ParticipantService.registerParticipantFromObj(
            embedMessage.id,
            new Participant(recruiter.userId, recruiter.displayName, recruiter.iconUrl, 0, new Date()),
        );

        const mention = `<@&${process.env.ROLE_ID_RECRUIT_PRIVATE}>`;
        const sentMessage = await recruitChannel.send({
            content: mention + ` ボタンを押して参加表明するでし！\n${getMemberMentions(recruitNum, [])}`,
        });
        // 募集文を削除してもボタンが動くように、bot投稿メッセージのメッセージIDでボタン作る
        sentMessage.edit({ components: [recruitActionRow(embedMessage)] });
        const deleteButtonMsg = await recruitChannel.send({
            components: [embedRecruitDeleteButton(sentMessage, embedMessage)],
        });

        await interaction.followUp({
            content: '募集完了でし！参加者が来るまで気長に待つでし！\n15秒間は募集を取り消せるでし！',
            ephemeral: true,
        });

        // 募集リスト更新
        if (recruitChannel.isTextBased()) {
            await sendRecruitSticky({ channelOpt: { guild: guild, channelId: recruitChannel.id } });
        }

        // 15秒後に削除ボタンを消す
        await sleep(15);
        const deleteButtonCheck = await searchMessageById(guild, recruitChannel.id, deleteButtonMsg.id);
        if (exists(deleteButtonCheck)) {
            deleteButtonCheck.delete();
        } else {
            return;
        }
    } catch (error) {
        logger.error(error);
    }
}

function isRoomUrl(url: string) {
    return url.match(/https:\/\/s.nintendo.com\//g) !== null;
}
