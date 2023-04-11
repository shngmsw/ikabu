import { CacheType, ChatInputCommandInteraction, CommandInteractionOptionResolver, EmbedBuilder } from 'discord.js';
import { log4js_obj } from '../../../../log4js_settings';
import { searchDBMemberById } from '../../../common/manager/member_manager';
import { searchMessageById } from '../../../common/manager/message_manager';
import { isNotEmpty, sleep } from '../../../common/others';
import { embedRecruitDeleteButton, notifyActionRow, recruitActionRow } from '../../buttons/create_recruit_buttons';
import { RecruitService } from '../../../../db/recruit_service';
import { ParticipantService } from '../../../../db/participants_service';
import { Participant } from '../../../../db/model/participant';
import { RecruitType } from '../../../../db/model/recruit';
import { availableRecruitString, sendStickyMessage } from '../../sticky/recruit_sticky_messages';

const logger = log4js_obj.getLogger('recruit');

export async function privateRecruit(interaction: ChatInputCommandInteraction) {
    if (!interaction.isCommand()) return;

    const options = interaction.options;

    if (options.getSubcommand() === 'recruit') {
        await interaction.deferReply();
        await sendPrivateRecruit(interaction, options);
    } else if (options.getSubcommand() === 'button') {
        await sendNotification(interaction);
    }
}

async function sendPrivateRecruit(
    interaction: ChatInputCommandInteraction,
    options: Omit<CommandInteractionOptionResolver<CacheType>, 'getMessage' | 'getFocused'>,
) {
    const startTime = interaction.options.getString('開始時刻') ?? 'ERROR';
    const time = interaction.options.getString('所要時間') ?? 'ERROR';
    const recruitNumText = options.getString('募集人数') ?? 'ERROR';
    const condition = options.getString('内容または参加条件') ?? 'なし';
    const logo = 'https://cdn.wikimg.net/en/splatoonwiki/images/1/1a/Private-battles-badge%402x.png';

    const guild = await interaction.guild?.fetch();
    if (guild === undefined) {
        throw new Error('guild cannot fetch.');
    }
    const recruitChannel = interaction.channel;
    if (recruitChannel === null) {
        throw new Error('recruitChannel is null.');
    }
    if (interaction.member === null) {
        throw new Error('interaction.member is null');
    }
    const recruiter = await searchDBMemberById(guild, interaction.member.user.id);

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
        ])
        .setColor('#5900b7')
        .setTimestamp()
        .setThumbnail(logo);

    try {
        const embedMessage = await interaction.editReply({
            content: `<@${recruiter.userId}>**たんのプライベートマッチ募集**`,
            embeds: [embed],
        });

        let recruitNum = Number(recruitNumText);
        if (isNaN(recruitNum)) {
            recruitNum = -1;
        }

        // DBに募集情報を登録
        await RecruitService.registerRecruit(
            guild.id,
            embedMessage.id,
            recruiter.userId,
            recruitNum,
            condition,
            null,
            RecruitType.PrivateRecruit,
        );

        // DBに参加者情報を登録
        await ParticipantService.registerParticipantFromObj(
            embedMessage.id,
            new Participant(recruiter.userId, recruiter.displayName, recruiter.iconUrl, 0, new Date()),
        );

        const mention = `<@&${process.env.ROLE_ID_RECRUIT_PRIVATE}>`;
        const sentMessage = await recruitChannel.send({
            content: mention + ' ボタンを押して参加表明するでし！',
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

        // ピン留め
        embedMessage.pin();

        // 募集リスト更新
        const sticky = await availableRecruitString(guild, recruitChannel.id, RecruitType.PrivateRecruit);
        await sendStickyMessage(guild, recruitChannel.id, sticky);

        // 15秒後に削除ボタンを消す
        await sleep(15);
        const deleteButtonCheck = await searchMessageById(guild, recruitChannel.id, deleteButtonMsg.id);
        if (isNotEmpty(deleteButtonCheck)) {
            deleteButtonCheck.delete();
        } else {
            return;
        }
    } catch (error) {
        logger.error(error);
    }
}

async function sendNotification(interaction: ChatInputCommandInteraction) {
    const mention = `<@&${process.env.ROLE_ID_RECRUIT_PRIVATE}>`;
    const guild = await interaction.guild?.fetch();
    await interaction.deferReply({ ephemeral: true });
    if (guild === undefined) {
        throw new Error('guild cannot fetch.');
    }
    const recruitChannel = interaction.channel;
    if (recruitChannel === null) {
        throw new Error('recruitChannel is null.');
    }
    if (interaction.member === null) {
        throw new Error('interaction.member is null');
    }
    const recruiter = await searchDBMemberById(guild, interaction.member.user.id);

    const sentMessage = await recruitChannel.send({
        content: mention + ' ボタンを押して参加表明するでし！',
    });
    // DBに募集情報を登録
    await RecruitService.registerRecruit(guild.id, sentMessage.id, recruiter.userId, -1, 'dummy', null, RecruitType.ButtonNotify);

    // DBに参加者情報を登録
    await ParticipantService.registerParticipantFromObj(
        sentMessage.id,
        new Participant(recruiter.userId, recruiter.displayName, recruiter.iconUrl, 0, new Date()),
    );

    // ピン留め
    sentMessage.pin();

    // 募集リスト更新
    const sticky = await availableRecruitString(guild, recruitChannel.id, RecruitType.ButtonNotify);
    await sendStickyMessage(guild, recruitChannel.id, sticky);

    await interaction.editReply({
        content: '募集完了でし！参加者が来るまで気長に待つでし！',
    });
    sentMessage.edit({ components: [notifyActionRow()] });
}
