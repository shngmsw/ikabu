const { EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle } = require('discord.js');
const { searchMemberById } = require('../../../manager/memberManager');
const { isEmpty } = require('../../../common');
const {
    registeredMembersStrings,
    registerMemberToDB,
    selectMemberFromDB,
    deleteMemberFromDB,
    deleteAllMemberFromDB,
    selectAllMemberFromDB,
    setTeam,
    setCount,
    getTeamMember,
    getForceSpectate,
    getParticipants,
    setWin,
    setForceSpectate,
} = require('./dviderDB');
const { searchMessageById } = require('../../../manager/messageManager');

module.exports = {
    dividerInitialMessage: dividerInitialMessage,
    joinButton: joinButton,
    cancelButton: cancelButton,
    registerButton: registerButton,
    alfaButton: alfaButton,
    bravoButton: bravoButton,
    spectateButton: spectateButton,
    endButton: endButton,
};

async function dividerInitialMessage(interaction) {
    try {
        const member = await searchMemberById(interaction.guild, interaction.member.user.id);
        const hostId = member.id;
        const teamNum = interaction.options.getInteger('各チームのメンバー数');

        if (teamNum <= 1 || teamNum >= 9) {
            // あまり多すぎるとEmbedの制限にひっかかってエラー吐きそうなので
            await interaction.reply({
                content: '各チームのメンバー数は2～8人まででし！\n観戦を含む参加者上限は20人まででし！',
                ephemeral: true,
            });
            return;
        }

        await interaction.deferReply();

        const embed = new EmbedBuilder();
        embed.setAuthor({ name: 'チーム分けツール', iconURL: 'https://raw.githubusercontent.com/shngmsw/ikabu/main/images/dice.png' });
        embed.addFields([
            {
                name: '参加登録をするには参加ボタンを押すでし！',
                value: `全員の登録が完了したら、${member.displayName}たんは登録完了ボタンを押すでし！`,
                inline: false,
            },
            {
                name: '参加者一覧',
                value: '参加者がいません',
                inline: false,
            },
        ]);

        const buttons = createInitButtons(hostId, teamNum);

        await interaction.editReply({
            embeds: [embed],
            components: [buttons],
        });
    } catch (err) {
        console.error(err);
        interaction.channel.send('なんかエラー出てるわ');
    }
}

async function joinButton(interaction, params) {
    /** @type {Discord.Snowflake} */
    try {
        await interaction.update({ components: [disableInitButtons('join')] });

        const member = await searchMemberById(interaction.guild, interaction.member.user.id);
        const hostId = params.get('hid');
        const teamNum = params.get('num');
        const host_member = await searchMemberById(interaction.guild, hostId);
        const messageId = interaction.message.id;
        const channelId = interaction.channel.id;

        if (member.voice.channelId != channelId) {
            await interaction.followUp({ content: 'VC参加者のみ参加できるでし！', ephemeral: true });
            await interaction.message.edit({ components: [createInitButtons(hostId, teamNum)] });
            return;
        }

        if ((await selectMemberFromDB(messageId, member.id)).length != 0) {
            await interaction.followUp({ content: '参加登録済みでし！', ephemeral: true });
            await interaction.message.edit({ components: [createInitButtons(hostId, teamNum)] });
            return;
        }

        // DB登録処理 (messageId=interaction.message.id, memberId=member.id, team=0, count=0, win=0, spectator=false)
        await registerMemberToDB(messageId, member.id, member.displayName, 0, 0, 0, false);

        const registeredMembers = await registeredMembersStrings(interaction.message.id);

        const embed = new EmbedBuilder();
        embed.setAuthor({ name: 'チーム分けツール', iconURL: 'https://raw.githubusercontent.com/shngmsw/ikabu/main/images/dice.png' });
        embed.addFields([
            {
                name: '参加登録をするには参加ボタンを押すでし！',
                value: `全員の登録が完了したら、${host_member.displayName}たんは登録完了ボタンを押すでし！`,
                inline: true,
            },
            {
                name: '参加者一覧　' + `[${registeredMembers[1]}]`,
                value: registeredMembers[0],
                inline: false,
            },
        ]);

        await interaction.message.edit({ embeds: [embed], components: [createInitButtons(hostId, teamNum)] });
        await interaction.followUp({ content: '登録したでし！', ephemeral: true });
    } catch (err) {
        console.error(err);
        interaction.channel.send('なんかエラー出てるわ');
    }
}

async function cancelButton(interaction, params) {
    /** @type {Discord.Snowflake} */
    try {
        await interaction.update({ components: [disableInitButtons('cancel')] });
        const messageId = interaction.message.id;
        const hostId = params.get('hid');
        const teamNum = params.get('num');
        const member = await searchMemberById(interaction.guild, interaction.member.user.id);
        const host_member = await searchMemberById(interaction.guild, hostId);

        // キャンセルボタンを押した人が参加登録をしている場合
        if ((await selectMemberFromDB(messageId, member.id)).length != 0) {
            await deleteMemberFromDB(messageId, member.id);

            let registeredMembers = await registeredMembersStrings(messageId);
            if (registeredMembers[1] == 0) {
                registeredMembers = '参加者がいません';
            }
            const embed = new EmbedBuilder();
            embed.setAuthor({ name: 'チーム分けツール', iconURL: 'https://raw.githubusercontent.com/shngmsw/ikabu/main/images/dice.png' });
            embed.addFields([
                {
                    name: '参加登録をするには参加ボタンを押すでし！',
                    value: `全員の登録が完了したら、${host_member.displayName}たんは登録完了ボタンを押すでし！`,
                    inline: true,
                },
                {
                    name: '参加者一覧　' + `[${registeredMembers[1]}]`,
                    value: registeredMembers[0],
                    inline: false,
                },
            ]);

            await interaction.message.edit({ embeds: [embed], components: [createInitButtons(hostId, teamNum)] });
            await interaction.followUp({ content: '参加をキャンセルしたでし！', ephemeral: true });
        } else if (hostId == interaction.member.user.id) {
            await deleteAllMemberFromDB(messageId);
            await interaction.message.delete();
            await interaction.followUp({ content: 'チーム分けをキャンセルしたでし！', ephemeral: true });
        } else {
            await interaction.followUp({ content: 'チーム分けをキャンセルできるのはホストだけでし！', ephemeral: true });
            await interaction.message.edit({ components: [createInitButtons(hostId, teamNum)] });
        }
    } catch (err) {
        console.error(err);
        interaction.channel.send('なんかエラー出てるわ');
    }
}

async function registerButton(interaction, params) {
    /** @type {Discord.Snowflake} */
    try {
        await interaction.update({ components: [disableInitButtons('register')] });
        const member = await searchMemberById(interaction.guild, interaction.member.user.id);
        const messageId = interaction.message.id;
        const hostId = params.get('hid');
        const teamNum = params.get('num');
        const count = 0;

        if (hostId != member.id) {
            await interaction.followUp({ content: '登録完了ボタンはコマンドを使用したユーザーしか使えないでし！', ephemeral: true });
            await interaction.message.edit({ components: [createInitButtons(hostId, teamNum)] });
            return;
        }

        const memberList = await selectAllMemberFromDB(messageId);

        if (memberList.length < teamNum * 2) {
            await interaction.followUp({ content: '参加メンバーが少なすぎるでし！', ephemeral: true });
            await interaction.message.edit({ components: [createInitButtons(hostId, teamNum)] });
            return;
        }

        let participants = arrayShuffle(memberList);

        for (let i = 0; i < participants.length; i++) {
            if (i < teamNum) {
                await setTeam(messageId, participants[i].member_id, 0);
                await setCount(messageId, participants[i].member_id, participants[i].joined_match_count + 1);
            } else if (i >= teamNum && i < teamNum * 2) {
                await setTeam(messageId, participants[i].member_id, 1);
                await setCount(messageId, participants[i].member_id, participants[i].joined_match_count + 1);
            } else if (i >= teamNum * 2) {
                await setTeam(messageId, participants[i].member_id, 2);
            } else {
                await interaction.followUp({ content: 'チーム分けエラー', ephemeral: true });
                await interaction.message.edit({ components: [createInitButtons(hostId, teamNum)] });
                return;
            }
        }

        const embed = await loadTeamEmbed(messageId, Number(count) + 1, member);
        const buttons = createButtons(messageId, teamNum, hostId, Number(count) + 1);

        const initButtons = disableInitButtons();

        interaction.channel.send({ embeds: [embed], components: [buttons] });
        interaction.message.edit({ components: [initButtons] });
        await interaction.editReply({ content: 'チームを更新したでし！', ephemeral: true });
    } catch (err) {
        console.error(err);
        interaction.channel.send('なんかエラー出てるわ');
    }
}

async function alfaButton(interaction, params) {
    await matching(interaction, params, 0);
}

async function bravoButton(interaction, params) {
    await matching(interaction, params, 1);
}

async function matching(interaction, params, winTeam) {
    try {
        let winTeamName;
        switch (winTeam) {
            case 0:
                winTeamName = 'alfa';
                break;
            case 1:
                winTeamName = 'bravo';
                break;
            default:
                winTeamName = 'unknown';
                break;
        }

        await interaction.update({ components: [disableButton(winTeamName)] });

        const member = await searchMemberById(interaction.guild, interaction.member.user.id);
        interaction.message.reply({ content: `${winTeamName}が勝ったでし！` });
        const messageId = params.get('mid');
        const hostId = params.get('hid');
        const teamNum = params.get('num');
        const count = params.get('count');

        if (member.id != hostId) {
            await interaction.followUp({ content: 'このボタンはコマンドを使用したユーザーしか使えないでし！', ephemeral: true });
            await interaction.message.edit({ components: [createButtons(messageId, teamNum, hostId, count)] });
            return;
        }

        const winMember = await getTeamMember(messageId, winTeam);

        for (let member of winMember) {
            await setWin(messageId, member.member_id, Number(member.win) + 1);
        }

        const participants = await getParticipants(messageId, teamNum);
        const fullMembers = await selectAllMemberFromDB(messageId);

        let participantsIdList = participants.map((participant) => participant.member_id);

        // 観戦者セット
        for (let member of fullMembers) {
            if (!participantsIdList.includes(member.member_id)) {
                await setTeam(messageId, member.member_id, 2);
                await setForceSpectate(messageId, member.member_id, false);
            }
        }

        // NOTE: 1位と最下位を同じチームにし、1位と2位を別チームにする
        //
        // 上位半分は偶数をalfa、奇数をbravo
        let orderByWinRateArray = orderByWinRate(participants);
        let upperHalfParticipants = orderByWinRateArray.slice(0, orderByWinRateArray.length / 2);
        let lowerHalfParticipants = orderByWinRateArray.slice(orderByWinRateArray.length / 2);
        for (let i in upperHalfParticipants) {
            if (i % 2 == 0) {
                await setTeam(messageId, upperHalfParticipants[i].member_id, 0);
            } else {
                await setTeam(messageId, upperHalfParticipants[i].member_id, 1);
            }
        }
        // 下位半分は偶数をbravo、奇数をalfa
        for (let i in lowerHalfParticipants) {
            if (i % 2 == 0) {
                await setTeam(messageId, lowerHalfParticipants[i].member_id, 1);
            } else {
                await setTeam(messageId, lowerHalfParticipants[i].member_id, 0);
            }
        }

        const embed = await loadTeamEmbed(messageId, Number(count) + 1, member);
        const buttons = createButtons(messageId, teamNum, hostId, Number(count) + 1);

        for (let participant of participants) {
            await setCount(messageId, participant.member_id, Number(participant.joined_match_count + 1));
        }

        const disableButtons = disableButton();
        interaction.message.edit({ components: [disableButtons] });
        interaction.channel.send({ embeds: [embed], components: [buttons] });
        await interaction.followUp({ content: 'チームを更新したでし！', ephemeral: true });
    } catch (err) {
        console.error(err);
        interaction.channel.send('なんかエラー出てるわ');
    }
}

async function spectateButton(interaction, params) {
    try {
        await interaction.update({ components: [disableButton('spectate')] });

        const member = await searchMemberById(interaction.guild, interaction.member.user.id);
        const messageId = params.get('mid');
        const hostId = params.get('hid');
        const hostMember = await searchMemberById(interaction.guild, hostId);
        const teamNum = params.get('num');
        const count = params.get('count');
        const fullMembers = await selectAllMemberFromDB(messageId);

        let fullIdList = fullMembers.map((member) => member.member_id);

        const buttons = createButtons(messageId, teamNum, hostId, count);

        if (!fullIdList.includes(member.id)) {
            await interaction.followUp({ content: 'このチーム分けに参加してないでし！', ephemeral: true });
            await interaction.message.edit({ components: [buttons] });
            return;
        }

        const wantSpectateList = await getForceSpectate(messageId);
        let wantSpectateIdList = wantSpectateList.map((member) => member.member_id);

        if (wantSpectateIdList.includes(member.id)) {
            await setForceSpectate(messageId, member.id, false);
            const embed = await loadTeamEmbed(messageId, count, member);
            await interaction.message.edit({ embeds: [embed], components: [buttons] });

            await interaction.followUp({ content: '観戦希望を取り下げたでし！', ephemeral: true });
        } else {
            if (wantSpectateIdList.length > fullMembers.length - teamNum * 2 - 1) {
                await interaction.followUp({ content: '観戦席はもう空いてないでし！', ephemeral: true });
                await interaction.message.edit({ components: [buttons] });
                return;
            }

            await setForceSpectate(messageId, member.id, true);
            const embed = await loadTeamEmbed(messageId, count, hostMember);
            await interaction.message.edit({ embeds: [embed], components: [buttons] });

            await interaction.followUp({
                content: '観戦希望を申し込んだでし！\nもう一度押すと希望を取り下げられるでし！',
                ephemeral: true,
            });
        }
    } catch (err) {
        console.error(err);
        interaction.channel.send('なんかエラー出てるわ');
    }
}

async function endButton(interaction, params) {
    try {
        await interaction.update({ components: [disableButton('end')] });

        const member = await searchMemberById(interaction.guild, interaction.member.user.id);
        const messageId = params.get('mid');
        const hostId = params.get('hid');
        const teamNum = params.get('num');
        const count = params.get('count');

        if (member.id != hostId) {
            await interaction.followUp({ content: 'このボタンはコマンドを使用したユーザーしか使えないでし！', ephemeral: true });
            await interaction.message.edit({ components: [createButtons(messageId, teamNum, hostId, count)] });
            return;
        }

        await interaction.message.edit({ components: [disableButton()] });
        await deleteAllMemberFromDB(messageId);
        const message = await searchMessageById(interaction.guild, interaction.channel.id, interaction.message.id);
        message.reply({ content: 'チーム分けを終了したでし！' });
    } catch (err) {
        console.error(err);
        interaction.channel.send('なんかエラー出てるわ');
    }
}

function arrayShuffle(array) {
    for (var i = array.length - 1; 0 < i; i--) {
        // 0〜(i+1)の範囲で値を取得
        var r = Math.floor(Math.random() * (i + 1));

        // 要素の並び替えを実行
        var tmp = array[i];
        array[i] = array[r];
        array[r] = tmp;
    }
    return array;
}

async function loadTeamEmbed(messageId, count, hostMember) {
    let alfaList = usersString(await getTeamMember(messageId, 0));
    let bravoList = usersString(await getTeamMember(messageId, 1));
    let spectators = await getTeamMember(messageId, 2);
    let wantSpectate = await getForceSpectate(messageId);

    if (isEmpty(spectators)) {
        spectators = 'なし';
    } else {
        spectators = usersString(spectators);
    }

    if (isEmpty(wantSpectate)) {
        wantSpectate = 'なし';
    } else {
        wantSpectate = usersString(wantSpectate);
    }

    const embed = new EmbedBuilder();
    embed.setAuthor({
        name: 'チーム分けツール　【' + `${count}回戦】`,
        iconURL: 'https://raw.githubusercontent.com/shngmsw/ikabu/main/images/dice.png',
    });
    embed.addFields([
        {
            name: `${hostMember.displayName}` + 'たんは勝ったチームのボタンを押すでし！',
            value: `次回観戦したい人は観戦希望ボタンを押すでし！\n（観戦も自動決定するため非推奨）`,
            inline: true,
        },
        {
            name: 'alfaチーム　勝利数(勝率)',
            value: alfaList,
            inline: false,
        },
        {
            name: 'bravoチーム　勝利数(勝率)',
            value: bravoList,
            inline: false,
        },
        {
            name: '観戦席',
            value: spectators,
            inline: false,
        },
        {
            name: '次回観戦希望者',
            value: wantSpectate,
            inline: false,
        },
    ]);
    return embed;
}

function createInitButtons(hostId, teamNum) {
    const joinParams = new URLSearchParams();
    joinParams.append('t', 'join');
    joinParams.append('num', teamNum);
    joinParams.append('hid', hostId);

    const registerParams = new URLSearchParams();
    registerParams.append('t', 'register');
    registerParams.append('num', teamNum);
    registerParams.append('hid', hostId);

    const cancelParams = new URLSearchParams();
    cancelParams.append('t', 'cancel');
    cancelParams.append('num', teamNum);
    cancelParams.append('hid', hostId);

    const buttons = new ActionRowBuilder();
    buttons.addComponents([new ButtonBuilder().setCustomId(joinParams.toString()).setLabel('参加').setStyle(ButtonStyle.Primary)]);
    buttons.addComponents([new ButtonBuilder().setCustomId(registerParams.toString()).setLabel('登録完了').setStyle(ButtonStyle.Success)]);
    buttons.addComponents([new ButtonBuilder().setCustomId(cancelParams.toString()).setLabel('キャンセル').setStyle(ButtonStyle.Danger)]);
    return buttons;
}

function createButtons(messageId, teamNum, hostId, count) {
    const alfaParams = new URLSearchParams();
    alfaParams.append('t', 'alfa');
    alfaParams.append('num', teamNum);
    alfaParams.append('hid', hostId);
    alfaParams.append('mid', messageId);
    alfaParams.append('count', count);

    const bravoParams = new URLSearchParams();
    bravoParams.append('t', 'bravo');
    bravoParams.append('num', teamNum);
    bravoParams.append('hid', hostId);
    bravoParams.append('mid', messageId);
    bravoParams.append('count', count);

    const spectateParams = new URLSearchParams();
    spectateParams.append('t', 'spectate');
    spectateParams.append('num', teamNum);
    spectateParams.append('hid', hostId);
    spectateParams.append('mid', messageId);
    spectateParams.append('count', count);

    const endParams = new URLSearchParams();
    endParams.append('t', 'end');
    endParams.append('num', teamNum);
    endParams.append('hid', hostId);
    endParams.append('mid', messageId);
    endParams.append('count', count);

    const buttons = new ActionRowBuilder();
    buttons.addComponents([new ButtonBuilder().setCustomId(alfaParams.toString()).setLabel('alfa').setStyle(ButtonStyle.Danger)]);
    buttons.addComponents([new ButtonBuilder().setCustomId(bravoParams.toString()).setLabel('bravo').setStyle(ButtonStyle.Primary)]);
    buttons.addComponents([
        new ButtonBuilder().setCustomId(spectateParams.toString()).setLabel('観戦希望').setStyle(ButtonStyle.Secondary),
    ]);
    buttons.addComponents([new ButtonBuilder().setCustomId(endParams.toString()).setLabel('終了').setStyle(ButtonStyle.Danger)]);
    return buttons;
}

function disableInitButtons(thinking = 'none') {
    const initButtons = new ActionRowBuilder();
    if (thinking == 'join') {
        initButtons.addComponents([
            new ButtonBuilder()
                .setCustomId('join')
                .setEmoji(process.env.RECRUIT_LOADING_EMOJI_ID)
                .setStyle(ButtonStyle.Primary)
                .setDisabled(),
        ]);
    } else {
        initButtons.addComponents([new ButtonBuilder().setCustomId('join').setLabel('参加').setStyle(ButtonStyle.Primary).setDisabled()]);
    }
    if (thinking == 'register') {
        initButtons.addComponents([
            new ButtonBuilder()
                .setCustomId('register')
                .setEmoji(process.env.RECRUIT_LOADING_EMOJI_ID)
                .setStyle(ButtonStyle.Success)
                .setDisabled(),
        ]);
    } else {
        initButtons.addComponents([
            new ButtonBuilder().setCustomId('register').setLabel('登録完了').setStyle(ButtonStyle.Success).setDisabled(),
        ]);
    }
    if (thinking == 'cancel') {
        initButtons.addComponents([
            new ButtonBuilder()
                .setCustomId('cancel')
                .setEmoji(process.env.RECRUIT_LOADING_EMOJI_ID)
                .setStyle(ButtonStyle.Danger)
                .setDisabled(),
        ]);
    } else {
        initButtons.addComponents([
            new ButtonBuilder().setCustomId('cancel').setLabel('キャンセル').setStyle(ButtonStyle.Danger).setDisabled(),
        ]);
    }
    return initButtons;
}

function disableButton(thinking = 'none') {
    const buttons = new ActionRowBuilder();
    if (thinking == 'alfa') {
        buttons.addComponents([
            new ButtonBuilder()
                .setCustomId('alfa')
                .setEmoji(process.env.RECRUIT_LOADING_EMOJI_ID)
                .setStyle(ButtonStyle.Danger)
                .setDisabled(),
        ]);
    } else {
        buttons.addComponents([new ButtonBuilder().setCustomId('alfa').setLabel('alfa').setStyle(ButtonStyle.Danger).setDisabled()]);
    }
    if (thinking == 'bravo') {
        buttons.addComponents([
            new ButtonBuilder()
                .setCustomId('bravo')
                .setEmoji(process.env.RECRUIT_LOADING_EMOJI_ID)
                .setStyle(ButtonStyle.Primary)
                .setDisabled(),
        ]);
    } else {
        buttons.addComponents([new ButtonBuilder().setCustomId('bravo').setLabel('bravo').setStyle(ButtonStyle.Primary).setDisabled()]);
    }
    if (thinking == 'spectate') {
        buttons.addComponents([
            new ButtonBuilder()
                .setCustomId('spectate')
                .setEmoji(process.env.RECRUIT_LOADING_EMOJI_ID)
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(),
        ]);
    } else {
        buttons.addComponents([
            new ButtonBuilder().setCustomId('spectate').setLabel('観戦希望').setStyle(ButtonStyle.Secondary).setDisabled(),
        ]);
    }
    if (thinking == 'end') {
        buttons.addComponents([
            new ButtonBuilder()
                .setCustomId('end')
                .setEmoji(process.env.RECRUIT_LOADING_EMOJI_ID)
                .setStyle(ButtonStyle.Danger)
                .setDisabled(),
        ]);
    } else {
        buttons.addComponents([new ButtonBuilder().setCustomId('end').setLabel('終了').setStyle(ButtonStyle.Danger).setDisabled()]);
    }
    return buttons;
}

function usersString(array) {
    try {
        let orderByWinRateArray = orderByWinRate(array);
        let usersString = '';

        for (let i = 0; i < orderByWinRateArray.length; i++) {
            const member = orderByWinRateArray[i];
            let winRate;
            if (member.joined_match_count != 0) {
                winRate = (member.win_rate * 100).toFixed(1);
            } else {
                winRate = ' - ';
            }
            const maxNameLength = getMaxNameLength(orderByWinRateArray);
            const truncatedName = truncateString(member.member_name);
            const username = spacePadding(truncatedName, maxNameLength);
            usersString = usersString + `\n${username}　\`${member.win}勝(${winRate}％)\``;
        }
        return usersString;
    } catch (err) {
        console.error(err);
        interaction.channel.send('なんかエラー出てるわ');
    }
}

function orderByWinRate(array) {
    return array.sort(function (p1, p2) {
        let p1Key = p1.win_rate,
            p2Key = p2.win_rate;
        if (p1Key < p2Key) {
            return 1;
        }
        if (p1Key > p2Key) {
            return -1;
        }
        return 0;
    });
}

function getMaxNameLength(array) {
    const nameLengthList = array.map((member) => getLengthBasedOnZenkaku(truncateString(member.member_name)));
    const aryMax = function (a, b) {
        return Math.max(a, b);
    };
    let max = nameLengthList.reduce(aryMax);

    return max;
}

/**
 * 全角文字は1文字で半角文字は0.5文字としてカウントした文字列全体の文字数を返す
 */
function getLengthBasedOnZenkaku(str) {
    let len = 0;

    for (let i = 0; i < str.length; i++) {
        str[i].match(/[ -~]/) ? (len += 0.5) : (len += 1);
    }

    return len;
}

function spacePadding(val, len) {
    let zenkakuCharCount = getZenkakuCharCount(val);
    let hankakuCharCount = getHankakuCharCount(val);
    let paddingSpaceCount = len - (zenkakuCharCount + Math.round(hankakuCharCount / 2));
    for (let i = 0; i < paddingSpaceCount; i++) {
        val = val + '　';
    }
    return val;
}

function getZenkakuCharCount(str) {
    let count = 0;
    for (var i = 0; i < str.length; i++) {
        count += str.charCodeAt(i) <= 255 ? 0 : 1;
    }
    return count;
}

function getHankakuCharCount(str) {
    let count = 0;
    for (var i = 0; i < str.length; i++) {
        count += str.charCodeAt(i) <= 255 ? 1 : 0;
    }
    return count;
}

function truncateString(str, size, suffix) {
    if (!str) str = '';
    if (!size) size = 21;
    if (!suffix) suffix = '…';

    var b = 0;
    for (var i = 0; i < str.length; i++) {
        b += str.charCodeAt(i) <= 255 ? 1 : 2;
        // 全角スペースが含まれていないときのみ
        if (b > size) {
            return str.substr(0, i) + suffix;
        }
    }
    return str;
}
