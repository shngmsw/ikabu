import { AttachmentBuilder, ChatInputCommandInteraction, GuildMember, PermissionsBitField, User, VoiceChannel } from 'discord.js';
import { RecruitService } from '../../../../db/recruit_service';
import { log4js_obj } from '../../../../log4js_settings';
import { checkFes, fetchSchedule, getFesData } from '../../../common/apis/splatoon3_ink';
import { setButtonDisable } from '../../../common/button_components';
import { searchAPIMemberById, searchDBMemberById } from '../../../common/manager/member_manager';
import { searchMessageById } from '../../../common/manager/message_manager';
import { searchRoleById, searchRoleIdByName } from '../../../common/manager/role_manager';
import { isNotEmpty, sleep } from '../../../common/others';
import { recruitActionRow, recruitDeleteButton, unlockChannelButton } from '../../buttons/create_recruit_buttons';
import { recruitFesCanvas, ruleFesCanvas } from '../../canvases/fes_canvas';
import { getMemberMentions } from '../buttons/other_events';
import { Participant } from '../../../../db/model/participant';
import { ParticipantService } from '../../../../db/participants_service';
import { RecruitType } from '../../../../db/model/recruit';
import { RecruitOpCode } from '../../canvases/regenerate_canvas';
const logger = log4js_obj.getLogger('recruit');

export async function fesRecruit(interaction: ChatInputCommandInteraction) {
    if (!interaction.isCommand()) return;

    const options = interaction.options;
    const channel = interaction.channel;
    const voiceChannel = interaction.options.getChannel('使用チャンネル');
    const recruitNum = options.getInteger('募集人数') ?? -1;
    let condition = options.getString('参加条件');
    const guild = await interaction.guild?.fetch();
    const hostMember = await searchAPIMemberById(guild, interaction.member?.user.id);
    const user1 = options.getUser('参加者1');
    const user2 = options.getUser('参加者2');
    const team = interaction.commandName;
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

    try {
        const data = await fetchSchedule();

        if (!checkFes(data.schedule, type)) {
            await interaction.editReply({
                content: '募集を建てようとした期間はフェスが行われていないでし！',
            });
            return;
        }

        const fesData = await getFesData(data, type);

        let txt = `<@${hostMember.user.id}>` + '**たんのフェスマッチ募集**\n';
        const members = [];

        if (user1 !== null) {
            members.push(`<@${user1.id}>` + 'たん');
        }
        if (user2 !== null) {
            members.push(`<@${user2.id}>` + 'たん');
        }

        if (members.length != 0) {
            for (let i = 0; i < members.length; i++) {
                if (i == 0) {
                    txt = txt + members[i];
                } else {
                    txt = txt + 'と' + members[i];
                }
            }
            txt += 'の参加が既に決定しているでし！\n';
        }

        txt += 'よければ合流しませんか？';

        if (condition == null) condition = 'なし';

        await sendFesMatch(interaction, team, txt, recruitNum, condition, memberCounter, hostMember, user1, user2, fesData);
    } catch (error) {
        if (channel !== null) {
            channel.send('なんかエラーでてるわ');
        }
        logger.error(error);
    }
}

async function sendFesMatch(
    interaction: ChatInputCommandInteraction,
    team: string,
    txt: string,
    recruitNum: number,
    condition: string,
    count: number,
    hostMember: GuildMember,
    user1: User | null,
    user2: User | null,
    fesData: $TSFixMe,
) {
    const guild = await interaction.guild?.fetch();
    if (guild === undefined) {
        throw new Error('guild cannot fetch');
    }
    const mentionId = await searchRoleIdByName(guild, team);
    const teamRole = await searchRoleById(guild, mentionId);

    if (mentionId == null) {
        await interaction.editReply({
            content: '設定がおかしいでし！\n「お手数ですがサポートセンターまでご連絡お願いします。」でし！',
        });
        return;
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

    const recruitBuffer = await recruitFesCanvas(
        RecruitOpCode.open,
        recruitNum,
        count,
        hostPt,
        participant1,
        participant2,
        null,
        team,
        teamRole.hexColor,
        condition,
        channelName,
    );
    const recruit = new AttachmentBuilder(recruitBuffer, {
        name: 'ikabu_recruit.png',
    });

    const rule = new AttachmentBuilder(await ruleFesCanvas(fesData), {
        name: 'rules.png',
    });

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
            RecruitType.FestivalRecruit,
            team,
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
            content: `<@&${mentionId}>` + ' ボタンを押して参加表明するでし！',
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

        // 2時間後にボタンを無効化する
        await sleep(7200 - 15);
        const recruitData = await RecruitService.getRecruit(guild.id, image1Message.id);
        if (recruitData.length === 0) {
            return;
        }
        const participants = await ParticipantService.getAllParticipants(guild.id, image1Message.id);
        const memberList = getMemberMentions(recruitData[0], participants);
        const hostMention = `<@${hostMember.user.id}>`;

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
