import { AttachmentBuilder, ChatInputCommandInteraction, GuildMember, PermissionsBitField, User, VoiceChannel } from 'discord.js';
import { log4js_obj } from '../../../../log4js_settings';
import { checkBigRun, fetchSchedule } from '../../../common/apis/splatoon3_ink';
import { searchAPIMemberById, searchDBMemberById } from '../../../common/manager/member_manager';
import { searchMessageById } from '../../../common/manager/message_manager';
import { isEmpty, isNotEmpty, sleep } from '../../../common/others';
import { recruitActionRow, recruitDeleteButton, unlockChannelButton } from '../../buttons/create_recruit_buttons';
import { recruitBigRunCanvas, ruleBigRunCanvas } from '../../canvases/big_run_canvas';
import { recruitSalmonCanvas, ruleSalmonCanvas } from '../../canvases/salmon_canvas';
import { Participant } from '../../../../db/model/participant';
import { RecruitService } from '../../../../db/recruit_service';
import { ParticipantService } from '../../../../db/participants_service';
import { RecruitType } from '../../../../db/model/recruit';
import { RecruitOpCode } from '../../canvases/regenerate_canvas';

const logger = log4js_obj.getLogger('recruit');

export async function salmonRecruit(interaction: ChatInputCommandInteraction) {
    if (!interaction.isCommand()) return;

    const options = interaction.options;
    const channel = interaction.channel;
    const voiceChannel = interaction.options.getChannel('使用チャンネル');
    const recruitNum = options.getInteger('募集人数') ?? -1;
    let condition = options.getString('参加条件');
    const guild = await interaction.guild?.fetch();
    if (guild === undefined) {
        throw new Error('guild cannot fetch.');
    }
    const hostMember = await searchAPIMemberById(guild, interaction.member?.user.id);
    if (hostMember === null) {
        throw new Error('hostMember is null.');
    }
    const user1 = options.getUser('参加者1');
    const user2 = options.getUser('参加者2');
    let memberCounter = recruitNum; // プレイ人数のカウンター

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

    try {
        let txt = `<@${hostMember.user.id}>` + '**たんのバイト募集**\n';

        if (user1 !== null && user2 !== null) {
            txt = txt + `<@${user1.id}>` + 'たんと' + `<@${user2.id}>` + 'たんの参加が既に決定しているでし！';
        } else if (user1 !== null) {
            txt = txt + `<@${user1.id}>` + 'たんの参加が既に決定しているでし！';
        } else if (user2 !== null) {
            txt = txt + `<@${user2.id}>` + 'たんの参加が既に決定しているでし！';
        }

        txt += 'よければ合流しませんか？';

        if (condition == null) condition = 'なし';

        await sendSalmonRun(interaction, txt, recruitNum, condition, memberCounter, hostMember, user1, user2);
    } catch (error) {
        if (channel !== null) {
            channel.send('なんかエラーでてるわ');
        }
        logger.error(error);
    }
}

async function sendSalmonRun(
    interaction: ChatInputCommandInteraction,
    txt: string,
    recruitNum: number,
    condition: string,
    count: number,
    hostMember: GuildMember,
    user1: User | null,
    user2: User | null,
) {
    const guild = await interaction.guild?.fetch();
    if (guild === undefined) {
        throw new Error('guild cannot fetch');
    }
    const reservedChannel = interaction.options.getChannel('使用チャンネル');
    let channelName = null;
    if (reservedChannel !== null) {
        channelName = reservedChannel.name;
    }

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

    const data = await fetchSchedule();

    let recruitBuffer;
    if (checkBigRun(data.schedule, 0)) {
        recruitBuffer = await recruitBigRunCanvas(
            RecruitOpCode.open,
            recruitNum,
            count,
            hostPt,
            participant1,
            participant2,
            null,
            condition,
            channelName,
        );
    } else {
        recruitBuffer = await recruitSalmonCanvas(
            RecruitOpCode.open,
            recruitNum,
            count,
            hostPt,
            participant1,
            participant2,
            null,
            condition,
            channelName,
        );
    }
    if (isEmpty(recruitBuffer) || recruitBuffer === undefined) {
        throw new Error('recruitBuffer is empty');
    }

    let ruleBuffer;
    if (checkBigRun(data.schedule, 0)) {
        ruleBuffer = await ruleBigRunCanvas(data);
    } else {
        ruleBuffer = await ruleSalmonCanvas(data);
    }
    if (isEmpty(ruleBuffer) || ruleBuffer == null) {
        throw new Error('ruleBuffer is empty');
    }

    const recruit = new AttachmentBuilder(recruitBuffer, {
        name: 'ikabu_recruit.png',
    });
    const rule = new AttachmentBuilder(ruleBuffer, { name: 'schedule.png' });

    try {
        const recruitChannel = interaction.channel;
        if (recruitChannel === null) {
            throw new Error('recruitChannel is null.');
        }
        const mention = `<@&${process.env.ROLE_ID_RECRUIT_SALMON}>`;
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
            RecruitType.SalmonRecruit,
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
                components: [recruitActionRow(image1Message, reservedChannel.id)],
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

        // 2時間後にVCロックを解除する
        await sleep(7200 - 15);
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
