const { ChannelType } = require('discord.js');
const { searchMemberById } = require('../../../manager/memberManager');
const { checkFes, getRegularData, getAnarchyOpenData, getFesData, fetchSchedule } = require('../../../common/apis/splatoon3_ink');
const { isEmpty, isNotEmpty } = require('../../../common');
const { searchChannelIdByName } = require('../../../manager/channelManager');
const { sendRegularMatch } = require('./regular_recruit_modal');
const { sendAnarchyMatch } = require('./anarchy_recruit_modal');
const { sendSalmonRun } = require('./salmon_recruit_modal');
const { sendFesMatch } = require('./fes_recruit_modal');
const log4js = require('log4js');

module.exports = {
    modalRegularRecruit: modalRegularRecruit,
    modalAnarchyRecruit: modalAnarchyRecruit,
    modalSalmonRecruit: modalSalmonRecruit,
    modalFesRecruit: modalFesRecruit,
};

log4js.configure(process.env.LOG4JS_CONFIG_PATH);
const logger = log4js.getLogger('recruit');

async function modalRegularRecruit(interaction, params) {
    const guild = await interaction.guild.fetch();
    const channel = interaction.channel;
    const recruit_num = Number(interaction.fields.getTextInputValue('rNum'));
    let condition = interaction.fields.getTextInputValue('condition');
    const host_member = await searchMemberById(guild, interaction.member.user.id);
    const participants_list = interaction.fields.getTextInputValue('pList');
    const participants_num = Number(interaction.fields.getTextInputValue('pNum'));
    let member_counter = recruit_num; // プレイ人数のカウンター
    const type = 0; // now

    if (recruit_num < 1 || recruit_num > 7 || isNaN(recruit_num)) {
        await interaction.reply({
            content: '募集人数は1～7までで指定するでし！',
            ephemeral: true,
        });
        return;
    } else {
        member_counter++;
    }

    // プレイヤー指定があればカウンターを増やす
    if (participants_num < 0 || participants_num > 6 || isNaN(participants_num)) {
        await interaction.reply({
            content: '既にいる参加者の数は0～6までで指定するでし！',
            ephemeral: true,
        });
        return;
    } else {
        member_counter += participants_num;
    }

    if (member_counter > 8) {
        await interaction.reply({
            content: '募集人数がおかしいでし！',
            ephemeral: true,
        });
        return;
    }

    // 'インタラクションに失敗'が出ないようにするため
    await interaction.deferReply();

    try {
        const data = await fetchSchedule();

        if (checkFes(data.schedule, type)) {
            const fes_channel1_id = await searchChannelIdByName(guild, 'フウカ募集', ChannelType.GuildText, null);
            const fes_channel2_id = await searchChannelIdByName(guild, 'ウツホ募集', ChannelType.GuildText, null);
            const fes_channel3_id = await searchChannelIdByName(guild, 'マンタロー募集', ChannelType.GuildText, null);
            await interaction.editReply({
                content: `募集を建てようとした期間はフェス中でし！\n<#${fes_channel1_id}>, <#${fes_channel2_id}>, <#${fes_channel3_id}>のチャンネルを使うでし！`,
                ephemeral: true,
            });
            return;
        }

        const regular_data = await getRegularData(data, type);

        let txt = `<@${host_member.user.id}>` + '**たんのナワバリ募集**\n';

        if (isNotEmpty(participants_list)) {
            txt = txt + '`' + participants_list + '`の参加が既に決定しているでし！\n';
        }

        txt += 'よければ合流しませんか？';

        if (isEmpty(condition)) condition = 'なし';

        let user1 = null;
        let user2 = null;
        let user3 = null;

        if (participants_num >= 1) {
            user1 = 'dummy_icon';
        }

        if (participants_num >= 2) {
            user2 = 'dummy_icon';
        }

        if (participants_num >= 3) {
            user3 = 'dummy_icon';
        }

        await sendRegularMatch(interaction, txt, recruit_num, condition, member_counter, host_member, user1, user2, user3, regular_data);
    } catch (error) {
        channel.send('なんかエラーでてるわ');
        logger.error(error);
    }
}

async function modalAnarchyRecruit(interaction, params) {
    const guild = await interaction.guild.fetch();
    const channel = interaction.channel;
    const recruit_num = Number(interaction.fields.getTextInputValue('rNum'));
    let condition = interaction.fields.getTextInputValue('condition');
    const host_member = await searchMemberById(guild, interaction.member.user.id);
    let user1 = interaction.fields.getTextInputValue('participant1');
    let user2 = interaction.fields.getTextInputValue('participant2');
    const participants_num = Number(interaction.fields.getTextInputValue('pNum'));
    let member_counter = recruit_num; // プレイ人数のカウンター
    const type = 0; // now

    if (recruit_num < 1 || recruit_num > 3 || isNaN(recruit_num)) {
        await interaction.reply({
            content: '募集人数は1～3までで指定するでし！',
            ephemeral: true,
        });
        return;
    } else {
        member_counter++;
    }

    if (participants_num < 0 || participants_num > 2 || isNaN(participants_num)) {
        await interaction.reply({
            content: '既にいる参加者の数は0～2までで指定するでし！',
            ephemeral: true,
        });
        return;
    } else {
        member_counter += participants_num;
    }

    if (member_counter > 4) {
        await interaction.reply({
            content: '募集人数がおかしいでし！',
            ephemeral: true,
        });
        return;
    }

    // 'インタラクションに失敗'が出ないようにするため
    await interaction.deferReply();
    const rank = '指定なし';

    const members = await guild.members.fetch();

    let user1_mention;
    let user2_mention;

    if (isNotEmpty(user1)) {
        // ユーザータグからメンバー取得
        let member = members.find((member) => member.user.tag === user1);
        if (isNotEmpty(member)) {
            user1 = member;
            user1_mention = `<@${member.user.id}>`;
        } else {
            user1_mention = user1;
        }
    } else {
        user1 = null;
    }

    if (isNotEmpty(user2)) {
        // ユーザータグからメンバー取得
        let member = members.find((member) => member.user.tag === user2);
        if (isNotEmpty(member)) {
            user2 = member;
            user2_mention = `<@${member.user.id}>`;
        } else {
            user2_mention = user2;
        }
    } else {
        user2 = null;
    }

    try {
        const data = await fetchSchedule();

        if (checkFes(data.schedule, type)) {
            const fes_channel1_id = await searchChannelIdByName(guild, 'フウカ募集', ChannelType.GuildText, null);
            const fes_channel2_id = await searchChannelIdByName(guild, 'ウツホ募集', ChannelType.GuildText, null);
            const fes_channel3_id = await searchChannelIdByName(guild, 'マンタロー募集', ChannelType.GuildText, null);
            await interaction.editReply({
                content: `募集を建てようとした期間はフェス中でし！\n<#${fes_channel1_id}>, <#${fes_channel2_id}>, <#${fes_channel3_id}>のチャンネルを使うでし！`,
                ephemeral: true,
            });
            return;
        }

        const anarchy_data = await getAnarchyOpenData(data, type);

        let txt = `<@${host_member.user.id}>` + '**たんのバンカラ募集**\n';
        if (user1 != null && user2 != null) {
            txt = txt + user1_mention + 'たんと' + user2_mention + 'たんの参加が既に決定しているでし！';
        } else if (user1 != null) {
            txt = txt + user1_mention + 'たんの参加が既に決定しているでし！';
        } else if (user2 != null) {
            txt = txt + user2_mention + 'たんの参加が既に決定しているでし！';
        }

        if (isEmpty(condition)) condition = 'なし';

        if (user1 === user1_mention && isNotEmpty(user1)) {
            user1 = 'dummy_icon';
        }

        if (user2 === user2_mention && isNotEmpty(user2)) {
            user2 = 'dummy_icon';
        }

        await sendAnarchyMatch(interaction, txt, recruit_num, condition, member_counter, rank, host_member, user1, user2, anarchy_data);
    } catch (error) {
        channel.send('なんかエラーでてるわ');
        logger.error(error);
    }
}

async function modalSalmonRecruit(interaction) {
    const guild = await interaction.guild.fetch();
    const channel = interaction.channel;
    const recruit_num = Number(interaction.fields.getTextInputValue('rNum'));
    let condition = interaction.fields.getTextInputValue('condition');
    const host_member = await searchMemberById(guild, interaction.member.user.id);
    let user1 = interaction.fields.getTextInputValue('participant1');
    let user2 = interaction.fields.getTextInputValue('participant2');
    const participants_num = Number(interaction.fields.getTextInputValue('pNum'));
    let member_counter = recruit_num; // プレイ人数のカウンター
    const type = 0; // now

    if (recruit_num < 1 || recruit_num > 3 || isNaN(recruit_num)) {
        await interaction.reply({
            content: '募集人数は1～3までで指定するでし！',
            ephemeral: true,
        });
        return;
    } else {
        member_counter++;
    }

    if (participants_num < 0 || participants_num > 2 || isNaN(participants_num)) {
        await interaction.reply({
            content: '既にいる参加者の数は0～2までで指定するでし！',
            ephemeral: true,
        });
        return;
    } else {
        member_counter += participants_num;
    }

    if (member_counter > 4) {
        await interaction.reply({
            content: '募集人数がおかしいでし！',
            ephemeral: true,
        });
        return;
    }

    // 'インタラクションに失敗'が出ないようにするため
    await interaction.deferReply();

    try {
        const members = await guild.members.fetch();

        let user1_mention;
        let user2_mention;

        if (isNotEmpty(user1)) {
            // ユーザータグからメンバー取得
            let member = members.find((member) => member.user.tag === user1);
            if (isNotEmpty(member)) {
                user1 = member;
                user1_mention = `<@${member.user.id}>`;
            } else {
                user1_mention = user1;
            }
        } else {
            user1 = null;
        }

        if (isNotEmpty(user2)) {
            // ユーザータグからメンバー取得
            let member = members.find((member) => member.user.tag === user2);
            if (isNotEmpty(member)) {
                user2 = member;
                user2_mention = `<@${member.user.id}>`;
            } else {
                user2_mention = user2;
            }
        } else {
            user2 = null;
        }

        let txt = `<@${host_member.user.id}>` + '**たんのバイト募集**\n';
        if (user1 != null && user2 != null) {
            txt = txt + user1_mention + 'たんと' + user2_mention + 'たんの参加が既に決定しているでし！';
        } else if (user1 != null) {
            txt = txt + user1_mention + 'たんの参加が既に決定しているでし！';
        } else if (user2 != null) {
            txt = txt + user2_mention + 'たんの参加が既に決定しているでし！';
        }

        txt += 'よければ合流しませんか？';

        if (isEmpty(condition)) condition = 'なし';

        if (user1 === user1_mention && isNotEmpty(user1)) {
            user1 = 'dummy_icon';
        }

        if (user2 === user2_mention && isNotEmpty(user2)) {
            user2 = 'dummy_icon';
        }

        await sendSalmonRun(interaction, txt, recruit_num, condition, member_counter, host_member, user1, user2);
    } catch (error) {
        channel.send('なんかエラーでてるわ');
        logger.error(error);
    }
}

async function modalFesRecruit(interaction, params) {
    const guild = await interaction.guild.fetch();
    const channel = interaction.channel;
    const recruit_num = Number(interaction.fields.getTextInputValue('rNum'));
    let condition = interaction.fields.getTextInputValue('condition');
    const host_member = await searchMemberById(guild, interaction.member.user.id);
    let user1 = interaction.fields.getTextInputValue('participant1');
    let user2 = interaction.fields.getTextInputValue('participant2');
    const participants_num = Number(interaction.fields.getTextInputValue('pNum'));
    let member_counter = recruit_num; // プレイ人数のカウンター
    const type = 0; // now
    let recruit_channel_name = params.get('cn');
    let team_charactor_name = recruit_channel_name.slice(0, -2); // チャンネル名から'募集'を削除
    let team = team_charactor_name + '陣営';

    if (recruit_num < 1 || recruit_num > 3 || isNaN(recruit_num)) {
        await interaction.reply({
            content: '募集人数は1～3までで指定するでし！',
            ephemeral: true,
        });
        return;
    } else {
        member_counter++;
    }

    if (participants_num < 0 || participants_num > 2 || isNaN(participants_num)) {
        await interaction.reply({
            content: '既にいる参加者の数は0～2までで指定するでし！',
            ephemeral: true,
        });
        return;
    } else {
        member_counter += participants_num;
    }

    if (member_counter > 4) {
        await interaction.reply({
            content: '募集人数がおかしいでし！',
            ephemeral: true,
        });
        return;
    }

    // 'インタラクションに失敗'が出ないようにするため
    await interaction.deferReply();

    try {
        const data = await fetchSchedule();

        if (!checkFes(data.schedule, type)) {
            await interaction.editReply({
                content: '募集を建てようとした期間はフェスが行われていないでし！',
                ephemeral: true,
            });
            return;
        }

        const fes_data = await getFesData(data, type);

        let txt = `<@${host_member.user.id}>` + '**たんのフェスマッチ募集**\n';
        if (user1 != null && user2 != null) {
            txt = txt + user1_mention + 'たんと' + user2_mention + 'たんの参加が既に決定しているでし！';
        } else if (user1 != null) {
            txt = txt + user1_mention + 'たんの参加が既に決定しているでし！';
        } else if (user2 != null) {
            txt = txt + user2_mention + 'たんの参加が既に決定しているでし！';
        }

        if (isEmpty(condition)) condition = 'なし';

        if (user1 === user1_mention && isNotEmpty(user1)) {
            user1 = 'dummy_icon';
        }

        if (user2 === user2_mention && isNotEmpty(user2)) {
            user2 = 'dummy_icon';
        }

        await sendFesMatch(interaction, team, txt, recruit_num, condition, member_counter, host_member, user1, user2, fes_data);
    } catch (error) {
        channel.send('なんかエラーでてるわ');
        logger.error(error);
    }
}
