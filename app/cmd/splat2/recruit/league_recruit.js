const Canvas = require('canvas');
const path = require('path');
const fetch = require('node-fetch');
const app = require('app-root-path').resolve('app');
const { stage2txt, rule2txt, unixTime2hm, unixTime2ymdw } = require(app + '/common.js');
const { createRoundRect, drawArcImage, fillTextWithStroke } = require('./canvas_components.js');
const {
    recruitDeleteButton,
    recruitActionRow,
    disableButtons,
    recruitDeleteButtonWithChannel,
    recruitActionRowWithChannel,
    unlockChannelButton,
} = require('./button_components.js');
const { MessageAttachment, Permissions } = require('discord.js');
const { searchRoleIdByName } = require(app + '/manager/roleManager.js');

const schedule_url = 'https://splatoon2.ink/data/schedules.json';

Canvas.registerFont(path.resolve('./fonts/Splatfont.ttf'), { family: 'Splatfont' });
Canvas.registerFont(path.resolve('./fonts/GenShinGothic-P-Medium.ttf'), { family: 'Genshin' });
Canvas.registerFont(path.resolve('./fonts/GenShinGothic-P-Bold.ttf'), { family: 'Genshin-Bold' });
Canvas.registerFont(path.resolve('./fonts/SEGUISYM.TTF'), { family: 'SEGUI' });

module.exports = {
    leagueRecruit: leagueRecruit,
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function leagueRecruit(interaction) {
    if (!interaction.isCommand()) return;

    const options = interaction.options;
    const channel = interaction.channel;
    const voice_channel = interaction.options.getChannel('使用チャンネル');
    let recruit_num = options.getInteger('募集人数');
    let condition = options.getString('参加条件');
    let host_user = interaction.member.user;
    let user1 = options.getUser('参加者1');
    let user2 = options.getUser('参加者2');
    let member_counter = recruit_num; // リグマプレイ人数のカウンター
    let type;

    if (options.getSubcommand() === 'now') {
        type = 0;
    } else if (options.getSubcommand() === 'next') {
        type = 1;
    }

    if (recruit_num < 1 || recruit_num > 3) {
        await interaction.reply({
            content: '募集人数は1～3までで指定するでし！',
            ephemeral: true,
        });
        return;
    } else {
        member_counter++;
    }

    // プレイヤー指定があればカウンターを増やす
    if (user1 != null) member_counter++;
    if (user2 != null) member_counter++;

    if (member_counter != 2 && member_counter != 4) {
        await interaction.reply({
            content:
                '募集人数がおかしいでし！\n一緒に遊ぶメンバーがいる場合、参加者に指定するでし！\nこのサーバーにいないメンバーと遊ぶのはイカ部心得違反でし！',
            ephemeral: true,
        });
        return;
    }

    var usable_channel = ['alfa', 'bravo', 'charlie', 'delta', 'echo', 'fox', 'golf', 'hotel', 'india', 'juliett', 'kilo', 'lima', 'mike'];

    if (voice_channel != null) {
        if (voice_channel.members.size != 0 && !voice_channel.members.has(host_user.id)) {
            await interaction.reply({
                content: 'そのチャンネルは使用中でし！',
                ephemeral: true,
            });
            return;
        } else if (!usable_channel.includes(voice_channel.name)) {
            await interaction.reply({
                content: 'そのチャンネルは指定できないでし！\n🔉alfa ～ 🔉mikeの間のチャンネルで指定するでし！',
                ephemeral: true,
            });
            return;
        }
    }

    // 'インタラクションに失敗'が出ないようにするため
    await interaction.deferReply();

    // 新入部員用リグマ募集ようにメンションを変更
    let mention = '@everyone';
    if (channel.name === '🔰リグマ募集') {
        const role_id = await interaction.guild.roles.cache.find((role) => role.name === '🔰新入部員');
        mention = `${role_id}`;
    }

    try {
        const response = await fetch(schedule_url);
        const data = await response.json();
        const l_args = getLeague(data, type).split(',');
        let txt = `<@${host_user.id}>` + 'たんがリグメン募集中でし！\n';
        if (user1 != null && user2 != null) {
            txt = txt + `<@${user1.id}>` + 'たんと' + `<@${user2.id}>` + 'たんの参加が既に決定しているでし！';
        } else if (user1 != null) {
            txt = txt + `<@${user1.id}>` + 'たんの参加が既に決定しているでし！';
        } else if (user2 != null) {
            txt = txt + `<@${user2.id}>` + 'たんの参加が既に決定しているでし！';
        }

        if (condition == null) condition = 'なし';
        const stage_a = 'https://splatoon2.ink/assets/splatnet' + data.league[type].stage_a.image;
        const stage_b = 'https://splatoon2.ink/assets/splatnet' + data.league[type].stage_b.image;
        const stageImages = [stage_a, stage_b];
        await sendLeagueMatch(
            interaction,
            channel,
            mention,
            txt,
            recruit_num,
            condition,
            member_counter,
            host_user,
            user1,
            user2,
            l_args,
            stageImages,
        );
    } catch (error) {
        channel.send('なんかエラーでてるわ');
        console.error(error);
    }
}

async function sendLeagueMatch(
    interaction,
    channel,
    mention,
    txt,
    recruit_num,
    condition,
    count,
    host_user,
    user1,
    user2,
    l_args,
    stageImages,
) {
    let l_date = l_args[0]; // 日付
    let l_time = l_args[1]; // 時間
    let l_rule = l_args[2]; // ガチルール
    let l_stage1 = l_args[3]; // ステージ1
    let l_stage2 = l_args[4]; // ステージ2
    let thumbnail_url; // ガチルールのアイコン
    let thumbnailXP; // アイコンx座標
    let thumbnailYP; // アイコンy座標
    let thumbScaleX; // アイコン幅
    let thumbScaleY; // アイコン高さ
    switch (l_rule) {
        case 'ガチエリア':
            thumbnail_url = 'https://cdn.glitch.com/4ea6ca87-8ea7-482c-ab74-7aee445ea445%2Fobject_area.png';
            thumbnailXP = 600;
            thumbnailYP = 20;
            thumbScaleX = 90;
            thumbScaleY = 100;
            break;
        case 'ガチヤグラ':
            thumbnail_url = 'https://cdn.glitch.com/4ea6ca87-8ea7-482c-ab74-7aee445ea445%2Fobject_yagura.png';
            thumbnailXP = 595;
            thumbnailYP = 20;
            thumbScaleX = 90;
            thumbScaleY = 100;
            break;
        case 'ガチホコバトル':
            thumbnail_url = 'https://cdn.glitch.com/4ea6ca87-8ea7-482c-ab74-7aee445ea445%2Fobject_hoko.png';
            thumbnailXP = 585;
            thumbnailYP = 23;
            thumbScaleX = 110;
            thumbScaleY = 90;
            break;
        case 'ガチアサリ':
            thumbnail_url = 'https://cdn.glitch.com/4ea6ca87-8ea7-482c-ab74-7aee445ea445%2Fobject_asari.png';
            thumbnailXP = 570;
            thumbnailYP = 20;
            thumbScaleX = 120;
            thumbScaleY = 100;
            break;
        default:
            thumbnail_url = 'https://cdn.glitch.com/4ea6ca87-8ea7-482c-ab74-7aee445ea445%2Fleague.png';
            thumbnailXP = 595;
            thumbnailYP = 20;
            thumbScaleX = 100;
            thumbScaleY = 100;
            break;
    }

    const reserve_channel = interaction.options.getChannel('使用チャンネル');

    if (reserve_channel == null) {
        channel_name = '🔉 VC指定なし';
    } else {
        channel_name = '🔉 ' + reserve_channel.name;
    }

    const thumbnail = [thumbnail_url, thumbnailXP, thumbnailYP, thumbScaleX, thumbScaleY];

    const recruitBuffer = await recruitCanvas(recruit_num, count, host_user, user1, user2, condition, channel_name);
    const recruit = new MessageAttachment(recruitBuffer, 'ikabu_recruit.png');

    const rule = new MessageAttachment(await ruleCanvas(l_rule, l_date, l_time, l_stage1, l_stage2, stageImages, thumbnail), 'rules.png');

    try {
        const header = await interaction.editReply({ content: txt, files: [recruit, rule], ephemeral: false });
        const sentMessage = await interaction.channel.send({
            content: mention + ' ボタンを押して参加表明するでし！',
        });

        // 募集文を削除してもボタンが動くように、bot投稿メッセージのメッセージIDでボタン作る
        if (reserve_channel == null) {
            sentMessage.edit({ components: [recruitDeleteButton(sentMessage, header)] });
        } else {
            sentMessage.edit({ components: [recruitDeleteButtonWithChannel(sentMessage, reserve_channel.id, header)] });
            reserve_channel.permissionOverwrites.set(
                [
                    { id: interaction.guild.roles.everyone.id, deny: [Permissions.FLAGS.CONNECT] },
                    { id: host_user.id, allow: [Permissions.FLAGS.CONNECT] },
                ],
                'Reserve Voice Channel',
            );
        }

        if (count == 2) {
            await interaction.followUp({
                content:
                    '2リグで募集がかかったでし！\n4リグで募集をたてるには参加者に指定するか、募集人数を変更して募集し直すでし！\n15秒間は募集を取り消せるでし！',
                components: reserve_channel != null ? [unlockChannelButton(reserve_channel.id)] : [],
                ephemeral: true,
            });
        } else {
            await interaction.followUp({
                content: '募集完了でし！参加者が来るまで待つでし！\n15秒間は募集を取り消せるでし！',
                components: reserve_channel != null ? [unlockChannelButton(reserve_channel.id)] : [],
                ephemeral: true,
            });
        }

        // 15秒後に削除ボタンを消す
        await sleep(15000);
        let cmd_message = await channel.messages.cache.get(sentMessage.id);
        if (cmd_message != undefined) {
            if (reserve_channel == null) {
                sentMessage.edit({ components: [recruitActionRow(header)] });
            } else {
                sentMessage.edit({ components: [recruitActionRowWithChannel(reserve_channel.id, header)] });
            }
        }

        // 2時間後にボタンを無効化する
        await sleep(7200000 - 15000);
        const host_mention = `<@${host_user.id}>`;
        sentMessage.edit({
            content: `${host_mention}たんの募集は〆！`,
            components: [disableButtons()],
        });
        if (reserve_channel != null) {
            reserve_channel.permissionOverwrites.delete(interaction.guild.roles.everyone, 'UnLock Voice Channel');
            reserve_channel.permissionOverwrites.delete(host_user, 'UnLock Voice Channel');
        }
    } catch (error) {
        console.log(error);
    }
}

/*
 * 募集用のキャンバス(1枚目)を作成する
 */
async function recruitCanvas(recruit_num, count, host_user, user1, user2, condition, channel_name) {
    blank_avatar_url = 'https://raw.githubusercontent.com/shngmsw/ikabu/main/images/recruit/blank_avatar.png'; // blankのアバター画像URL

    const recruitCanvas = Canvas.createCanvas(720, 550);
    const recruit_ctx = recruitCanvas.getContext('2d');

    // 下地
    createRoundRect(recruit_ctx, 1, 1, 718, 548, 30);
    recruit_ctx.fillStyle = '#2F3136';
    recruit_ctx.fill();
    recruit_ctx.strokeStyle = '#FFFFFF';
    recruit_ctx.lineWidth = 4;
    recruit_ctx.stroke();

    let league_icon = await Canvas.loadImage('https://cdn.glitch.me/4ea6ca87-8ea7-482c-ab74-7aee445ea445%2Fleague.png');
    recruit_ctx.drawImage(league_icon, 20, 20, 80, 80);

    fillTextWithStroke(recruit_ctx, 'リーグマッチ', '50px Splatfont', '#F02D7E', '#bd2363', 1, 115, 80);

    // 募集主の画像
    let host_img = await Canvas.loadImage(host_user.displayAvatarURL({ format: 'png' }));
    recruit_ctx.save();
    drawArcImage(recruit_ctx, host_img, 40, 120, 50);
    recruit_ctx.strokeStyle = '#1e1f23';
    recruit_ctx.lineWidth = 9;
    recruit_ctx.stroke();
    recruit_ctx.restore();

    let user1_url = blank_avatar_url;
    let user2_url = blank_avatar_url;
    let user3_url = blank_avatar_url;

    // 参加者指定があれば、画像を拾ってくる
    if (user1 != null && user2 != null) {
        user1_url = user1.displayAvatarURL({ format: 'png' });
        user2_url = user2.displayAvatarURL({ format: 'png' });
    } else if (user1 != null && user2 == null) {
        user1_url = user1.displayAvatarURL({ format: 'png' });
    } else if (user1 == null && user2 != null) {
        user1_url = user2.displayAvatarURL({ format: 'png' });
    }

    let user1_img = await Canvas.loadImage(user1_url);
    recruit_ctx.save();
    drawArcImage(recruit_ctx, user1_img, 158, 120, 50);
    recruit_ctx.strokeStyle = '#1e1f23';
    recruit_ctx.lineWidth = 9;
    recruit_ctx.stroke();
    recruit_ctx.restore();

    // カウンターの値に応じて2リグ表記か4リグ表記か判定
    if (count == 4) {
        let user2_img = await Canvas.loadImage(user2_url);
        recruit_ctx.save();
        drawArcImage(recruit_ctx, user2_img, 276, 120, 50);
        recruit_ctx.strokeStyle = '#1e1f23';
        recruit_ctx.lineWidth = 9;
        recruit_ctx.stroke();
        recruit_ctx.restore();

        let user3_img = await Canvas.loadImage(user3_url);
        recruit_ctx.save();
        drawArcImage(recruit_ctx, user3_img, 394, 120, 50);
        recruit_ctx.strokeStyle = '#1e1f23';
        recruit_ctx.lineWidth = 9;
        recruit_ctx.stroke();
        recruit_ctx.restore();
    }

    let host_icon = await Canvas.loadImage('https://raw.githubusercontent.com/shngmsw/ikabu/main/images/recruit/squid.png');
    recruit_ctx.drawImage(host_icon, 0, 0, host_icon.width, host_icon.height, 90, 172, 75, 75);

    fillTextWithStroke(recruit_ctx, '募集人数', '39px "Splatfont"', '#FFFFFF', '#2D3130', 1, 525, 155);

    fillTextWithStroke(recruit_ctx, '@' + recruit_num, '42px "Splatfont"', '#FFFFFF', '#2D3130', 1, 580, 218);

    fillTextWithStroke(recruit_ctx, '参加条件', '43px "Splatfont"', '#FFFFFF', '#2D3130', 1, 35, 290);

    recruit_ctx.font = '30px "Genshin", "SEGUI"';
    const width = 600;
    const size = 40;
    const column_num = 4;
    let column = [''];
    let line = 0;
    condition = condition.replace('{br}', '\n', 'gm');

    // 幅に合わせて自動改行
    for (var i = 0; i < condition.length; i++) {
        var char = condition.charAt(i);

        if (char == '\n') {
            line++;
            column[line] = '';
        } else if (recruit_ctx.measureText(column[line] + char).width > width) {
            line++;
            column[line] = char;
        } else {
            column[line] += char;
        }
    }

    if (column.length > column_num) {
        column[column_num - 1] += '…';
    }

    for (var j = 0; j < column.length; j++) {
        if (j < column_num) {
            recruit_ctx.fillText(column[j], 65, 345 + size * j);
        }
    }

    fillTextWithStroke(recruit_ctx, channel_name, '37px "Splatfont"', '#FFFFFF', '#2D3130', 1, 30, 520);

    const recruit = recruitCanvas.toBuffer();
    return recruit;
}

/*
 * ルール情報のキャンバス(2枚目)を作成する
 */
async function ruleCanvas(l_rule, l_date, l_time, l_stage1, l_stage2, stageImages, thumbnail) {
    const ruleCanvas = Canvas.createCanvas(720, 550);
    const rule_ctx = ruleCanvas.getContext('2d');

    createRoundRect(rule_ctx, 1, 1, 718, 548, 30);
    rule_ctx.fillStyle = '#2F3136';
    rule_ctx.fill();
    rule_ctx.strokeStyle = '#FFFFFF';
    rule_ctx.lineWidth = 4;
    rule_ctx.stroke();

    fillTextWithStroke(rule_ctx, 'ルール', '33px Splatfont', '#FFFFFF', '#2D3130', 1, 35, 80);

    rule_width = rule_ctx.measureText(l_rule).width;
    fillTextWithStroke(rule_ctx, l_rule, '45px Splatfont', '#FFFFFF', '#2D3130', 1, (320 - rule_width) / 2, 145); // 中央寄せ

    fillTextWithStroke(rule_ctx, '日時', '32px Splatfont', '#FFFFFF', '#2D3130', 1, 35, 220);

    date_width = rule_ctx.measureText(l_date).width;
    fillTextWithStroke(rule_ctx, l_date, '35px Splatfont', '#FFFFFF', '#2D3130', 1, (350 - date_width) / 2, 270); // 中央寄せ

    time_width = rule_ctx.measureText(l_time).width;
    fillTextWithStroke(rule_ctx, l_time, '35px Splatfont', '#FFFFFF', '#2D3130', 1, 15 + (350 - time_width) / 2, 320); // 中央寄せ

    fillTextWithStroke(rule_ctx, 'ステージ', '33px Splatfont', '#FFFFFF', '#2D3130', 1, 35, 390);

    stage1_width = rule_ctx.measureText(l_stage1).width;
    fillTextWithStroke(rule_ctx, l_stage1, '35px Splatfont', '#FFFFFF', '#2D3130', 1, (350 - stage1_width) / 2 + 10, 440); // 中央寄せ

    stage2_width = rule_ctx.measureText(l_stage2).width;
    fillTextWithStroke(rule_ctx, l_stage2, '35px Splatfont', '#FFFFFF', '#2D3130', 1, (350 - stage2_width) / 2 + 10, 490); // 中央寄せ

    let stage1_img = await Canvas.loadImage(stageImages[0]);
    rule_ctx.save();
    rule_ctx.beginPath();
    createRoundRect(rule_ctx, 370, 130, 308, 176, 10);
    rule_ctx.clip();
    rule_ctx.drawImage(stage1_img, 370, 130, 308, 176);
    rule_ctx.strokeStyle = '#FFFFFF';
    rule_ctx.lineWidth = 6.0;
    rule_ctx.stroke();
    rule_ctx.restore();

    let stage2_img = await Canvas.loadImage(stageImages[1]);
    rule_ctx.save();
    rule_ctx.beginPath();
    createRoundRect(rule_ctx, 370, 340, 308, 176, 10);
    rule_ctx.clip();
    rule_ctx.drawImage(stage2_img, 370, 340, 308, 176);
    rule_ctx.strokeStyle = '#FFFFFF';
    rule_ctx.lineWidth = 6.0;
    rule_ctx.stroke();
    rule_ctx.restore();

    rule_ctx.save();
    const rule_img = await Canvas.loadImage(thumbnail[0]);
    rule_ctx.drawImage(rule_img, 0, 0, rule_img.width, rule_img.height, thumbnail[1], thumbnail[2], thumbnail[3], thumbnail[4]);
    rule_ctx.restore();

    createRoundRect(rule_ctx, 1, 1, 718, 548, 30);
    rule_ctx.clip();

    const rule = ruleCanvas.toBuffer();
    return rule;
}

/**
 * commonにあるgetLeagueを、情報を2行に分けるためにカスタムしたもの
 */
function getLeague(data, x) {
    let stage1;
    let stage2;
    let date;
    let time;
    let rule;
    let rstr;

    date = unixTime2ymdw(data.league[x].start_time);
    time = unixTime2hm(data.league[x].start_time) + ' – ' + unixTime2hm(data.league[x].end_time);
    rule = rule2txt(data.league[x].rule.key);
    stage1 = stage2txt(data.league[x].stage_a.id);
    stage2 = stage2txt(data.league[x].stage_b.id);
    rstr = date + ',' + time + ',' + rule + ',' + stage1 + ',' + stage2;
    return rstr;
}
