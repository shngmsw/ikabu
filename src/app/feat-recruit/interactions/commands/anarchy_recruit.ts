import {
    AttachmentBuilder,
    ChannelType,
    ChatInputCommandInteraction,
    GuildMember,
    PermissionsBitField,
    User,
    VoiceChannel,
} from 'discord.js';
import { RecruitService } from '../../../../db/recruit_service';
import { log4js_obj } from '../../../../log4js_settings';
import { checkFes, fetchSchedule, getAnarchyOpenData } from '../../../common/apis/splatoon3_ink';
import { setButtonDisable } from '../../../common/button_components';
import { searchChannelIdByName } from '../../../common/manager/channel_manager';
import { searchAPIMemberById, searchDBMemberById } from '../../../common/manager/member_manager';
import { searchMessageById } from '../../../common/manager/message_manager';
import { searchRoleIdByName } from '../../../common/manager/role_manager';
import { isNotEmpty, sleep } from '../../../common/others';
import { recruitActionRow, recruitDeleteButton, unlockChannelButton } from '../../buttons/create_recruit_buttons';
import { recruitAnarchyCanvas, ruleAnarchyCanvas } from '../../canvases/anarchy_canvas';
import { getMemberMentions } from '../buttons/other_events';
import { Participant } from '../../../../db/model/participant';
import { ParticipantService } from '../../../../db/participants_service';
import { RecruitType } from '../../../../db/model/recruit';
import { RecruitOpCode, regenerateCanvas } from '../../canvases/regenerate_canvas';
import { availableRecruitString, sendStickyMessage } from '../../sticky/recruit_sticky_messages';

const logger = log4js_obj.getLogger('recruit');

export async function anarchyRecruit(interaction: ChatInputCommandInteraction) {
    if (!interaction.isCommand()) return;

    const options = interaction.options;
    const channel = interaction.channel;
    const voiceChannel = interaction.options.getChannel('使用チャンネル');
    let rank = options.getString('募集ウデマエ');
    const recruitNum = options.getInteger('募集人数') ?? -1;
    let condition = options.getString('参加条件');
    const guild = await interaction.guild?.fetch();
    const hostMember = await searchAPIMemberById(guild, interaction.member?.user.id);
    const user1 = options.getUser('参加者1');
    const user2 = options.getUser('参加者2');
    let memberCounter = recruitNum; // プレイ人数のカウンター
    let type;

    if (options.getSubcommand() === 'now') {
        type = 0;
    } else if (options.getSubcommand() === 'next') {
        type = 1;
    }

    if (recruitNum < 1 || recruitNum > 3) {
        await interaction.reply({
            content: '募集人数は1～3までで指定するでし！',
            ephemeral: true,
        });
        return;
    } else {
        memberCounter++;
    }

    // プレイヤー指定があればカウンターを増やす
    if (user1 !== null) memberCounter++;
    if (user2 !== null) memberCounter++;

    if (memberCounter > 4) {
        await interaction.reply({
            content: '募集人数がおかしいでし！',
            ephemeral: true,
        });
        return;
    }

    const availableChannel = [
        'alfa',
        'bravo',
        'charlie',
        'delta',
        'echo',
        'fox',
        'golf',
        'hotel',
        'india',
        'juliett',
        'kilo',
        'lima',
        'mike',
    ];

    if (voiceChannel instanceof VoiceChannel) {
        if (voiceChannel.members.size != 0 && !voiceChannel.members.has(hostMember.user.id)) {
            await interaction.reply({
                content: 'そのチャンネルは使用中でし！',
                ephemeral: true,
            });
            return;
        } else if (!availableChannel.includes(voiceChannel.name)) {
            await interaction.reply({
                content: 'そのチャンネルは指定できないでし！\n🔉alfa ～ 🔉mikeの間のチャンネルで指定するでし！',
                ephemeral: true,
            });
            return;
        }
    }

    // 'インタラクションに失敗'が出ないようにするため
    await interaction.deferReply();

    let mention = `<@&${process.env.ROLE_ID_RECRUIT_ANARCHY}>`;
    // 募集条件がランクの場合はウデマエロールにメンション
    if (rank !== undefined && rank !== null) {
        const mentionId = await searchRoleIdByName(guild, rank);
        if (mentionId == null) {
            await interaction.editReply({
                content: '設定がおかしいでし！\n「お手数ですがサポートセンターまでご連絡お願いします。」でし！',
            });
            return;
        }
        mention = `<@&${mentionId}>`;
    } else {
        rank = '指定なし';
    }
    try {
        const data = await fetchSchedule();

        if (checkFes(data.schedule, type)) {
            const fesChannelId = await searchChannelIdByName(guild, 'フェス募集', ChannelType.GuildText, null);
            await interaction.editReply({
                content: `募集を建てようとした期間はフェス中でし！\nフェス募集をするには<#${fesChannelId}>のチャンネルを使うでし！`,
            });
            return;
        }

        const anarchyData = await getAnarchyOpenData(data, type);

        let txt = `<@${hostMember.user.id}>` + '**たんのバンカラ募集**\n';
        if (user1 !== null && user2 !== null) {
            txt = txt + `<@${user1.id}>` + 'たんと' + `<@${user2.id}>` + 'たんの参加が既に決定しているでし！';
        } else if (user1 !== null) {
            txt = txt + `<@${user1.id}>` + 'たんの参加が既に決定しているでし！';
        } else if (user2 !== null) {
            txt = txt + `<@${user2.id}>` + 'たんの参加が既に決定しているでし！';
        }

        if (condition == null) condition = 'なし';

        await sendAnarchyMatch(
            interaction,
            mention,
            txt,
            recruitNum,
            condition,
            memberCounter,
            rank,
            hostMember,
            user1,
            user2,
            anarchyData,
        );
    } catch (error) {
        if (channel !== null) {
            channel.send('なんかエラーでてるわ');
        }
        logger.error(error);
    }
}

async function sendAnarchyMatch(
    interaction: ChatInputCommandInteraction,
    mention: string,
    txt: string,
    recruitNum: number,
    condition: string,
    count: number,
    rank: string,
    hostMember: GuildMember,
    user1: User | null,
    user2: User | null,
    anarchyData: $TSFixMe,
) {
    let thumbnailUrl; // ガチルールのアイコン
    let thumbnailXP; // アイコンx座標
    let thumbnailYP; // アイコンy座標
    let thumbScaleX; // アイコン幅
    let thumbScaleY; // アイコン高さ
    switch (anarchyData.rule) {
        case 'ガチエリア':
            thumbnailUrl = 'https://cdn.glitch.com/4ea6ca87-8ea7-482c-ab74-7aee445ea445%2Fobject_area.png';
            thumbnailXP = 600;
            thumbnailYP = 20;
            thumbScaleX = 90;
            thumbScaleY = 100;
            break;
        case 'ガチヤグラ':
            thumbnailUrl = 'https://cdn.glitch.com/4ea6ca87-8ea7-482c-ab74-7aee445ea445%2Fobject_yagura.png';
            thumbnailXP = 595;
            thumbnailYP = 20;
            thumbScaleX = 90;
            thumbScaleY = 100;
            break;
        case 'ガチホコバトル':
            thumbnailUrl = 'https://cdn.glitch.com/4ea6ca87-8ea7-482c-ab74-7aee445ea445%2Fobject_hoko.png';
            thumbnailXP = 585;
            thumbnailYP = 23;
            thumbScaleX = 110;
            thumbScaleY = 90;
            break;
        case 'ガチアサリ':
            thumbnailUrl = 'https://cdn.glitch.com/4ea6ca87-8ea7-482c-ab74-7aee445ea445%2Fobject_asari.png';
            thumbnailXP = 570;
            thumbnailYP = 20;
            thumbScaleX = 120;
            thumbScaleY = 100;
            break;
        default:
            thumbnailUrl =
                'http://placehold.jp/15/4c4d57/ffffff/100x100.png?text=ここに画像を貼りたかったんだが、どうやらエラーみたいだ…。';
            thumbnailXP = 595;
            thumbnailYP = 20;
            thumbScaleX = 100;
            thumbScaleY = 100;
            break;
    }

    const guild = await interaction.guild?.fetch();
    if (guild === undefined) {
        throw new Error('guild cannot fetch');
    }
    const reservedChannel = interaction.options.getChannel('使用チャンネル');
    let channelName = null;
    if (reservedChannel !== null) {
        channelName = reservedChannel.name;
    }

    const thumbnail = [thumbnailUrl, thumbnailXP, thumbnailYP, thumbScaleX, thumbScaleY];

    const hostPt = new Participant(hostMember.id, hostMember.displayName, hostMember.displayAvatarURL({ extension: 'png' }), 0, new Date());

    let participant1 = null;
    let participant2 = null;

    if (user1 !== null) {
        const member = await searchDBMemberById(guild, user1.id);
        participant1 = new Participant(user1.id, member.displayName, member.iconUrl, 1, new Date());
    }
    if (user2 !== null) {
        const member = await searchDBMemberById(guild, user2.id);
        participant2 = new Participant(user2.id, member.displayName, member.iconUrl, 1, new Date());
    }

    const recruitBuffer = await recruitAnarchyCanvas(
        RecruitOpCode.open,
        recruitNum,
        count,
        hostPt,
        participant1,
        participant2,
        null,
        condition,
        rank,
        channelName,
    );
    const recruit = new AttachmentBuilder(recruitBuffer, {
        name: 'ikabu_recruit.png',
    });

    const rule = new AttachmentBuilder(await ruleAnarchyCanvas(anarchyData, thumbnail), { name: 'rules.png' });

    try {
        const recruitChannel = interaction.channel;

        if (recruitChannel === null) {
            throw new Error('recruitChannel is null.');
        }
        const image1Message = await interaction.editReply({
            content: txt,
            files: [recruit],
        });

        // DBに募集情報を登録
        await RecruitService.registerRecruit(
            guild.id,
            image1Message.id,
            hostMember.id,
            recruitNum,
            condition,
            channelName,
            RecruitType.AnarchyRecruit,
            rank,
        );

        // DBに参加者情報を登録
        await ParticipantService.registerParticipantFromObj(image1Message.id, hostPt);
        if (participant1 !== null) {
            await ParticipantService.registerParticipantFromObj(image1Message.id, participant1);
        }
        if (participant2 !== null) {
            await ParticipantService.registerParticipantFromObj(image1Message.id, participant2);
        }

        const image2Message = await recruitChannel.send({ files: [rule] });
        const sentMessage = await recruitChannel.send({
            content: mention + ' ボタンを押して参加表明するでし！',
        });

        // 募集文を削除してもボタンが動くように、bot投稿メッセージのメッセージIDでボタン作る
        const deleteButtonMsg = await recruitChannel.send({
            components: [recruitDeleteButton(sentMessage, image1Message, image2Message)],
        });

        if (reservedChannel instanceof VoiceChannel && hostMember.voice.channelId != reservedChannel.id) {
            sentMessage.edit({
                components: [recruitActionRow(image1Message, reservedChannel?.id)],
            });
            reservedChannel.permissionOverwrites.set(
                [
                    {
                        id: guild.roles.everyone.id,
                        deny: [PermissionsBitField.Flags.Connect],
                    },
                    {
                        id: hostMember.user.id,
                        allow: [PermissionsBitField.Flags.Connect],
                    },
                ],
                'Reserve Voice Channel',
            );

            await interaction.followUp({
                content: '募集完了でし！参加者が来るまで待つでし！\n15秒間は募集を取り消せるでし！',
                components: [unlockChannelButton(reservedChannel.id)],
                ephemeral: true,
            });
        } else {
            sentMessage.edit({ components: [recruitActionRow(image1Message)] });
            await interaction.followUp({
                content: '募集完了でし！参加者が来るまで待つでし！\n15秒間は募集を取り消せるでし！',
                ephemeral: true,
            });
        }

        // ピン留め
        image1Message.pin();

        // 募集リスト更新
        const sticky = await availableRecruitString(guild, recruitChannel.id, RecruitType.AnarchyRecruit);
        await sendStickyMessage(guild, recruitChannel.id, sticky);

        // 15秒後に削除ボタンを消す
        await sleep(15);
        const deleteButtonCheck = await searchMessageById(guild, recruitChannel.id, deleteButtonMsg.id);
        if (isNotEmpty(deleteButtonCheck)) {
            deleteButtonCheck.delete();
        } else {
            if (reservedChannel instanceof VoiceChannel && hostMember.voice.channelId != reservedChannel.id) {
                reservedChannel.permissionOverwrites.delete(guild.roles.everyone, 'UnLock Voice Channel');
                reservedChannel.permissionOverwrites.delete(hostMember.user, 'UnLock Voice Channel');
            }
            return;
        }

        // 2時間後にボタンを無効化する
        await sleep(7200 - 15);
        const recruitData = await RecruitService.getRecruit(guild.id, image1Message.id);
        if (recruitData.length === 0) {
            return;
        }
        const participants = await ParticipantService.getAllParticipants(guild.id, image1Message.id);
        const memberList = getMemberMentions(recruitData[0], participants);
        const hostMention = `<@${hostMember.user.id}>`;

        if (interaction.channelId !== null) {
            await regenerateCanvas(guild, interaction.channelId, image1Message.id, RecruitOpCode.close);
        }

        // DBから募集情報削除
        await RecruitService.deleteRecruit(guild.id, image1Message.id);
        await ParticipantService.deleteAllParticipant(image1Message.id);

        sentMessage.edit({
            content: '`[自動〆]`\n' + `${hostMention}たんの募集は〆！\n${memberList}`,
            components: await setButtonDisable(sentMessage),
        });
        // ピン留め解除
        image1Message.unpin();
        if (reservedChannel instanceof VoiceChannel && hostMember.voice.channelId != reservedChannel.id) {
            reservedChannel.permissionOverwrites.delete(guild.roles.everyone, 'UnLock Voice Channel');
            reservedChannel.permissionOverwrites.delete(hostMember.user, 'UnLock Voice Channel');
        }
    } catch (error) {
        logger.error(error);
    }
}
