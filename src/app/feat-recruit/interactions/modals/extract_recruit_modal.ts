import { ChannelType, GuildMember, ModalSubmitInteraction } from 'discord.js';
import { log4js_obj } from '../../../../log4js_settings';
import { checkFes, fetchSchedule, getAnarchyOpenData, getEventData, getFesData, getRegularData } from '../../../common/apis/splatoon3_ink';
import { searchChannelIdByName } from '../../../common/manager/channel_manager';
import { searchDBMemberById } from '../../../common/manager/member_manager';
import { assertExistCheck, exists, isEmpty, isNotEmpty, notExists } from '../../../common/others';
import { sendRecruitModalLog } from '../../../logs/modals/recruit_modal_log';
import { sendAnarchyMatch } from './anarchy_recruit_modal';
import { sendFesMatch } from './fes_recruit_modal';
import { sendRegularMatch } from './regular_recruit_modal';
import { sendSalmonRun } from './salmon_recruit_modal';
import { modalRecruit } from '../../../../constant';
import { Member } from '../../../../db/model/member';
import { sendEventMatch } from './event_recruit_modal';

const logger = log4js_obj.getLogger('recruit');

export async function modalRegularRecruit(interaction: ModalSubmitInteraction) {
    if (!interaction.inGuild()) return;

    assertExistCheck(interaction.guild, 'guild');
    assertExistCheck(interaction.channel, 'channel');

    const guild = await interaction.guild.fetch();
    const channel = interaction.channel;
    const recruitNum = Number(interaction.fields.getTextInputValue('rNum'));
    let condition = interaction.fields.getTextInputValue('condition');
    const hostMember = await searchDBMemberById(guild, interaction.member.user.id);

    assertExistCheck(hostMember, 'hostMember');

    const participantsList = interaction.fields.getTextInputValue('pList');
    const attendeeNum = Number(interaction.fields.getTextInputValue('pNum'));
    let memberCounter = recruitNum; // プレイ人数のカウンター
    const type = 0; // now

    if (recruitNum < 1 || recruitNum > 7 || isNaN(recruitNum)) {
        await interaction.reply({
            content: '募集人数は1～7までで指定するでし！',
            ephemeral: true,
        });
        return;
    } else {
        memberCounter++;
    }

    // プレイヤー指定があればカウンターを増やす
    if (attendeeNum < 0 || attendeeNum > 6 || isNaN(attendeeNum)) {
        await interaction.reply({
            content: '既にいる参加者の数は0～6までで指定するでし！',
            ephemeral: true,
        });
        return;
    } else {
        memberCounter += attendeeNum;
    }

    if (memberCounter > 8) {
        await interaction.reply({
            content: '募集人数がおかしいでし！',
            ephemeral: true,
        });
        return;
    }

    // 'インタラクションに失敗'が出ないようにするため
    await interaction.deferReply();

    await sendRecruitModalLog(interaction);

    try {
        const data = await fetchSchedule();

        if (checkFes(data.schedule, type)) {
            const fes1ChannelId = await searchChannelIdByName(guild, 'フウカ募集', ChannelType.GuildText, null);
            const fes2ChannelId = await searchChannelIdByName(guild, 'ウツホ募集', ChannelType.GuildText, null);
            const fes3ChannelId = await searchChannelIdByName(guild, 'マンタロー募集', ChannelType.GuildText, null);
            await interaction.editReply({
                content: `募集を建てようとした期間はフェス中でし！\n<#${fes1ChannelId}>, <#${fes2ChannelId}>, <#${fes3ChannelId}>のチャンネルを使うでし！`,
            });
            return;
        }

        const regularData = await getRegularData(data, type);

        let txt = `### <@${hostMember.userId}>` + 'たんのナワバリ募集\n';

        if (isNotEmpty(participantsList)) {
            txt = txt + '`' + participantsList + '`の参加が既に決定しているでし！\n';
        }

        txt += 'よければ合流しませんか？';

        if (isEmpty(condition)) condition = 'なし';

        let member1 = null;
        let member2 = null;
        let member3 = null;

        if (attendeeNum >= 1) {
            member1 = new Member(guild.id, 'attendee1', '参加確定者1', modalRecruit.placeHold, new Date());
        }

        if (attendeeNum >= 2) {
            member2 = new Member(guild.id, 'attendee2', '参加確定者2', modalRecruit.placeHold, new Date());
        }

        if (attendeeNum >= 3) {
            member3 = new Member(guild.id, 'attendee3', '参加確定者3', modalRecruit.placeHold, new Date());
        }

        await sendRegularMatch(interaction, txt, recruitNum, condition, memberCounter, hostMember, member1, member2, member3, regularData);
    } catch (error) {
        if (exists(channel)) {
            channel.send('なんかエラーでてるわ');
        }
        logger.error(error);
    }
}

export async function modalEventRecruit(interaction: ModalSubmitInteraction) {
    if (!interaction.inGuild()) return;

    assertExistCheck(interaction.guild, 'guild');
    assertExistCheck(interaction.channel, 'channel');

    const guild = await interaction.guild?.fetch();
    const channel = interaction.channel;
    const recruitNum = Number(interaction.fields.getTextInputValue('rNum'));
    let condition = interaction.fields.getTextInputValue('condition');
    const hostMember = await searchDBMemberById(guild, interaction.member.user.id);

    assertExistCheck(hostMember, 'hostMember');

    const user1: GuildMember | string | null = interaction.fields.getTextInputValue('participant1');
    const user2: GuildMember | string | null = interaction.fields.getTextInputValue('participant2');
    const attendeeNum = Number(interaction.fields.getTextInputValue('pNum'));
    let memberCounter = recruitNum; // プレイ人数のカウンター

    if (recruitNum < 1 || recruitNum > 3 || isNaN(recruitNum)) {
        await interaction.reply({
            content: '募集人数は1～3までで指定するでし！',
            ephemeral: true,
        });
        return;
    } else {
        memberCounter++;
    }

    if (attendeeNum < 0 || attendeeNum > 2 || isNaN(attendeeNum)) {
        await interaction.reply({
            content: '既にいる参加者の数は0～2までで指定するでし！',
            ephemeral: true,
        });
        return;
    } else {
        memberCounter += attendeeNum;
    }

    if (memberCounter > 4) {
        await interaction.reply({
            content: '募集人数がおかしいでし！',
            ephemeral: true,
        });
        return;
    }

    // 'インタラクションに失敗'が出ないようにするため
    await interaction.deferReply();

    await sendRecruitModalLog(interaction);

    const members = await guild.members.fetch();

    let member1 = null;
    let member2 = null;
    let member1Mention = null;
    let member2Mention = null;

    if (exists(user1) && user1 !== '') {
        // ユーザータグからメンバー取得
        const member = members.find((member: $TSFixMe) => member.user.tag === user1);
        if (member !== undefined) {
            member1 = await searchDBMemberById(guild, member.user.id);
            assertExistCheck(member1, 'member1');
            member1Mention = `<@${member1.userId}>`;
        } else {
            member1 = new Member(guild.id, 'attendee1', '参加確定者1', modalRecruit.placeHold, new Date());
            member1Mention = user1;
        }
    }

    if (exists(user2) && user2 !== '') {
        // ユーザータグからメンバー取得
        const member = members.find((member: $TSFixMe) => member.user.tag === user2);
        if (member !== undefined) {
            member2 = await searchDBMemberById(guild, member.user.id);
            assertExistCheck(member2, 'member2');
            member2Mention = `<@${member2.userId}>`;
        } else {
            member2 = new Member(guild.id, 'attendee2', '参加確定者2', modalRecruit.placeHold, new Date());
            member2Mention = user2;
        }
    }

    try {
        const data = await fetchSchedule();

        const eventData = await getEventData(data);

        if (notExists(eventData)) {
            await interaction.deleteReply();
            return await interaction.followUp({
                content: `現在イベントマッチは開催されていないでし！`,
                ephemeral: true,
            });
        }

        let txt = `### <@${hostMember.userId}>` + 'たんのイベマ募集\n';
        txt = txt + '```' + `${eventData.regulation.replace(/<br \/>/g, '\n')}` + '```\n';
        if (exists(member1Mention) && exists(member2Mention)) {
            txt = txt + member1Mention + 'たんと' + member2Mention + 'たんの参加が既に決定しているでし！';
        } else if (exists(member1Mention)) {
            txt = txt + member1Mention + 'たんの参加が既に決定しているでし！';
        } else if (exists(member2Mention)) {
            txt = txt + member2Mention + 'たんの参加が既に決定しているでし！';
        }

        if (isEmpty(condition)) condition = 'なし';

        await sendEventMatch(interaction, txt, recruitNum, condition, memberCounter, hostMember, member1, member2, eventData);
    } catch (error) {
        if (exists(channel)) {
            channel.send('なんかエラーでてるわ');
        }
        logger.error(error);
    }
}

export async function modalAnarchyRecruit(interaction: ModalSubmitInteraction) {
    if (!interaction.inGuild()) return;

    assertExistCheck(interaction.guild, 'guild');
    assertExistCheck(interaction.channel, 'channel');

    const guild = await interaction.guild?.fetch();
    const channel = interaction.channel;
    const recruitNum = Number(interaction.fields.getTextInputValue('rNum'));
    let condition = interaction.fields.getTextInputValue('condition');
    const hostMember = await searchDBMemberById(guild, interaction.member.user.id);

    assertExistCheck(hostMember, 'hostMember');

    const user1: GuildMember | string | null = interaction.fields.getTextInputValue('participant1');
    const user2: GuildMember | string | null = interaction.fields.getTextInputValue('participant2');
    const attendeeNum = Number(interaction.fields.getTextInputValue('pNum'));
    let memberCounter = recruitNum; // プレイ人数のカウンター
    const type = 0; // now

    if (recruitNum < 1 || recruitNum > 3 || isNaN(recruitNum)) {
        await interaction.reply({
            content: '募集人数は1～3までで指定するでし！',
            ephemeral: true,
        });
        return;
    } else {
        memberCounter++;
    }

    if (attendeeNum < 0 || attendeeNum > 2 || isNaN(attendeeNum)) {
        await interaction.reply({
            content: '既にいる参加者の数は0～2までで指定するでし！',
            ephemeral: true,
        });
        return;
    } else {
        memberCounter += attendeeNum;
    }

    if (memberCounter > 4) {
        await interaction.reply({
            content: '募集人数がおかしいでし！',
            ephemeral: true,
        });
        return;
    }

    // 'インタラクションに失敗'が出ないようにするため
    await interaction.deferReply();

    await sendRecruitModalLog(interaction);

    const rank = '指定なし';

    const members = await guild.members.fetch();

    let member1 = null;
    let member2 = null;
    let member1Mention = null;
    let member2Mention = null;

    if (exists(user1) && user1 !== '') {
        // ユーザータグからメンバー取得
        const member = members.find((member: $TSFixMe) => member.user.tag === user1);
        if (member !== undefined) {
            member1 = await searchDBMemberById(guild, member.user.id);
            assertExistCheck(member1, 'member1');
            member1Mention = `<@${member1.userId}>`;
        } else {
            member1 = new Member(guild.id, 'attendee1', '参加確定者1', modalRecruit.placeHold, new Date());
            member1Mention = user1;
        }
    }

    if (exists(user2) && user2 !== '') {
        // ユーザータグからメンバー取得
        const member = members.find((member: $TSFixMe) => member.user.tag === user2);
        if (member !== undefined) {
            member2 = await searchDBMemberById(guild, member.user.id);
            assertExistCheck(member2, 'member2');
            member2Mention = `<@${member2.userId}>`;
        } else {
            member2 = new Member(guild.id, 'attendee2', '参加確定者2', modalRecruit.placeHold, new Date());
            member2Mention = user2;
        }
    }

    try {
        const data = await fetchSchedule();

        if (checkFes(data.schedule, type)) {
            const fes1ChannelId = await searchChannelIdByName(guild, 'フウカ募集', ChannelType.GuildText, null);
            const fes2ChannelId = await searchChannelIdByName(guild, 'ウツホ募集', ChannelType.GuildText, null);
            const fes3ChannelId = await searchChannelIdByName(guild, 'マンタロー募集', ChannelType.GuildText, null);
            await interaction.editReply({
                content: `募集を建てようとした期間はフェス中でし！\n<#${fes1ChannelId}>, <#${fes2ChannelId}>, <#${fes3ChannelId}>のチャンネルを使うでし！`,
            });
            return;
        }

        const anarchyData = await getAnarchyOpenData(data, type);

        let txt = `### <@${hostMember.userId}>` + 'たんのバンカラ募集\n';
        if (exists(member1Mention) && exists(member2Mention)) {
            txt = txt + member1Mention + 'たんと' + member2Mention + 'たんの参加が既に決定しているでし！';
        } else if (exists(member1Mention)) {
            txt = txt + member1Mention + 'たんの参加が既に決定しているでし！';
        } else if (exists(member2Mention)) {
            txt = txt + member2Mention + 'たんの参加が既に決定しているでし！';
        }

        if (isEmpty(condition)) condition = 'なし';

        await sendAnarchyMatch(interaction, txt, recruitNum, condition, memberCounter, rank, hostMember, member1, member2, anarchyData);
    } catch (error) {
        if (exists(channel)) {
            channel.send('なんかエラーでてるわ');
        }
        logger.error(error);
    }
}

export async function modalSalmonRecruit(interaction: ModalSubmitInteraction) {
    if (!interaction.inGuild()) return;

    assertExistCheck(interaction.guild, 'guild');
    assertExistCheck(interaction.channel, 'channel');

    const guild = await interaction.guild?.fetch();
    const channel = interaction.channel;
    const recruitNum = Number(interaction.fields.getTextInputValue('rNum'));
    let condition = interaction.fields.getTextInputValue('condition');
    const hostMember = await searchDBMemberById(guild, interaction.member.user.id);

    assertExistCheck(hostMember, 'hostMember');

    const user1 = interaction.fields.getTextInputValue('participant1');
    const user2 = interaction.fields.getTextInputValue('participant2');
    const attendeeNum = Number(interaction.fields.getTextInputValue('pNum'));
    let memberCounter = recruitNum; // プレイ人数のカウンター

    if (recruitNum < 1 || recruitNum > 3 || isNaN(recruitNum)) {
        await interaction.reply({
            content: '募集人数は1～3までで指定するでし！',
            ephemeral: true,
        });
        return;
    } else {
        memberCounter++;
    }

    if (attendeeNum < 0 || attendeeNum > 2 || isNaN(attendeeNum)) {
        await interaction.reply({
            content: '既にいる参加者の数は0～2までで指定するでし！',
            ephemeral: true,
        });
        return;
    } else {
        memberCounter += attendeeNum;
    }

    if (memberCounter > 4) {
        await interaction.reply({
            content: '募集人数がおかしいでし！',
            ephemeral: true,
        });
        return;
    }

    // 'インタラクションに失敗'が出ないようにするため
    await interaction.deferReply();

    await sendRecruitModalLog(interaction);

    try {
        const members = await guild.members.fetch();

        let member1 = null;
        let member2 = null;
        let member1Mention = null;
        let member2Mention = null;

        if (exists(user1) && user1 !== '') {
            // ユーザータグからメンバー取得
            const member = members.find((member: $TSFixMe) => member.user.tag === user1);
            if (member !== undefined) {
                member1 = await searchDBMemberById(guild, member.user.id);
                assertExistCheck(member1, 'member1');
                member1Mention = `<@${member1.userId}>`;
            } else {
                member1 = new Member(guild.id, 'attendee1', '参加確定者1', modalRecruit.placeHold, new Date());
                member1Mention = user1;
            }
        }

        if (exists(user2) && user2 !== '') {
            // ユーザータグからメンバー取得
            const member = members.find((member: $TSFixMe) => member.user.tag === user2);
            if (member !== undefined) {
                member2 = await searchDBMemberById(guild, member.user.id);
                assertExistCheck(member2, 'member2');
                member2Mention = `<@${member2.userId}>`;
            } else {
                member2 = new Member(guild.id, 'attendee2', '参加確定者2', modalRecruit.placeHold, new Date());
                member2Mention = user2;
            }
        }

        let txt = `### <@${hostMember.userId}>` + 'たんのバイト募集\n';
        if (exists(member1Mention) && exists(member2Mention)) {
            txt = txt + member1Mention + 'たんと' + member2Mention + 'たんの参加が既に決定しているでし！';
        } else if (exists(member1Mention)) {
            txt = txt + member1Mention + 'たんの参加が既に決定しているでし！';
        } else if (exists(member2Mention)) {
            txt = txt + member2Mention + 'たんの参加が既に決定しているでし！';
        }

        txt += 'よければ合流しませんか？';

        if (isEmpty(condition)) condition = 'なし';

        await sendSalmonRun(interaction, txt, recruitNum, condition, memberCounter, hostMember, member1, member2);
    } catch (error) {
        if (exists(channel)) {
            channel.send('なんかエラーでてるわ');
        }
        logger.error(error);
    }
}

export async function modalFesRecruit(interaction: ModalSubmitInteraction, params: $TSFixMe) {
    if (!interaction.inGuild()) return;

    assertExistCheck(interaction.guild, 'guild');
    assertExistCheck(interaction.channel, 'channel');

    const guild = await interaction.guild?.fetch();
    const channel = interaction.channel;
    const recruitNum = Number(interaction.fields.getTextInputValue('rNum'));
    let condition = interaction.fields.getTextInputValue('condition');
    const hostMember = await searchDBMemberById(guild, interaction.member.user.id);

    assertExistCheck(hostMember, 'hostMember');

    const user1 = interaction.fields.getTextInputValue('participant1');
    const user2 = interaction.fields.getTextInputValue('participant2');
    const attendeeNum = Number(interaction.fields.getTextInputValue('pNum'));
    let memberCounter = recruitNum; // プレイ人数のカウンター
    const type = 0; // now
    const recruitChannelName = params.get('cn');
    const teamCharacterName = recruitChannelName.slice(0, -2); // チャンネル名から'募集'を削除
    const team = teamCharacterName + '陣営';

    if (recruitNum < 1 || recruitNum > 3 || isNaN(recruitNum)) {
        await interaction.reply({
            content: '募集人数は1～3までで指定するでし！',
            ephemeral: true,
        });
        return;
    } else {
        memberCounter++;
    }

    if (attendeeNum < 0 || attendeeNum > 2 || isNaN(attendeeNum)) {
        await interaction.reply({
            content: '既にいる参加者の数は0～2までで指定するでし！',
            ephemeral: true,
        });
        return;
    } else {
        memberCounter += attendeeNum;
    }

    if (memberCounter > 4) {
        await interaction.reply({
            content: '募集人数がおかしいでし！',
            ephemeral: true,
        });
        return;
    }

    // 'インタラクションに失敗'が出ないようにするため
    await interaction.deferReply();

    await sendRecruitModalLog(interaction);

    try {
        const data = await fetchSchedule();

        if (!checkFes(data.schedule, type)) {
            await interaction.editReply({
                content: '募集を建てようとした期間はフェスが行われていないでし！',
            });
            return;
        }

        const fesData = await getFesData(data, type);

        const members = await guild.members.fetch();

        let member1 = null;
        let member2 = null;
        let member1Mention = null;
        let member2Mention = null;

        if (exists(user1) && user1 !== '') {
            // ユーザータグからメンバー取得
            const member = members.find((member: $TSFixMe) => member.user.tag === user1);
            if (member !== undefined) {
                member1 = await searchDBMemberById(guild, member.user.id);
                assertExistCheck(member1, 'member1');
                member1Mention = `<@${member1.userId}>`;
            } else {
                member1 = new Member(guild.id, 'attendee1', '参加確定者1', modalRecruit.placeHold, new Date());
                member1Mention = user1;
            }
        }

        if (exists(user2) && user2 !== '') {
            // ユーザータグからメンバー取得
            const member = members.find((member: $TSFixMe) => member.user.tag === user2);
            if (member !== undefined) {
                member2 = await searchDBMemberById(guild, member.user.id);
                assertExistCheck(member2, 'member2');
                member2Mention = `<@${member2.userId}>`;
            } else {
                member2 = new Member(guild.id, 'attendee2', '参加確定者2', modalRecruit.placeHold, new Date());
                member2Mention = user2;
            }
        }

        let txt = `### <@${hostMember.userId}>` + 'たんのフェスマッチ募集\n';
        if (exists(member1Mention) && exists(member2Mention)) {
            txt = txt + member1Mention + 'たんと' + member2Mention + 'たんの参加が既に決定しているでし！';
        } else if (exists(member1Mention)) {
            txt = txt + member1Mention + 'たんの参加が既に決定しているでし！';
        } else if (exists(member2Mention)) {
            txt = txt + member2Mention + 'たんの参加が既に決定しているでし！';
        }

        if (isEmpty(condition)) condition = 'なし';

        await sendFesMatch(interaction, team, txt, recruitNum, condition, memberCounter, hostMember, member1, member2, fesData);
    } catch (error) {
        if (exists(channel)) {
            channel.send('なんかエラーでてるわ');
        }
        logger.error(error);
    }
}
