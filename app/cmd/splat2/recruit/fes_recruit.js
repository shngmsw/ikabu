const Canvas = require('canvas');
const path = require('path');
const fetch = require('node-fetch');
const { stage2txt, rule2txt, unixTime2hm, unixTime2ymdw } = require('../../common.js');
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
const { searchRoleIdByName } = require('../../manager/roleManager.js');
const schedule_url = 'https://splatoon2.ink/data/schedules.json';
const teamNames = ['フウカ陣営', 'マンタロー陣営', 'ウツホ陣営'];
const teamColors = ['#006EFF', '#FF1F1F', '#FBFF00'];

/**
 * どうせそのうちAPIから拾ってくるようにするはず…？なので
 * 2のAPI入れたままにしてCanvas部分だけ手動で非表示にしてます。
 */

Canvas.registerFont(path.resolve('./fonts/Splatfont.ttf'), { family: 'Splatfont' });
Canvas.registerFont(path.resolve('./fonts/GenShinGothic-P-Medium.ttf'), { family: 'Genshin' });
Canvas.registerFont(path.resolve('./fonts/GenShinGothic-P-Bold.ttf'), { family: 'Genshin-Bold' });
Canvas.registerFont(path.resolve('./fonts/SEGUISYM.TTF'), { family: 'SEGUI' });

module.exports = {
    fesRecruit: fesRecruit,
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function fesRecruit(interaction) {
    if (!interaction.isCommand()) return;

    const options = interaction.options;
    const channel = interaction.channel;
    const voice_channel = interaction.options.getChannel('使用チャンネル');
    let recruit_num = options.getInteger('募集人数');
    let condition = options.getString('参加条件');
    let host_user = interaction.member.user;
    let user1 = options.getUser('参加者1');
    let user2 = options.getUser('参加者2');
    let team = interaction.commandName;
    let member_counter = recruit_num; // プレイ人数のカウンター
    // let type;

    if (team == null) {
    }

    // if (options.getSubcommand() === 'now') {
    //     type = 0;
    // } else if (options.getSubcommand() === 'next') {
    //     type = 1;
    // }

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

    try {
        const response = await fetch(schedule_url);
        const data = await response.json();
        // const args = getFes(data, type).split(',');
        let txt = `<@${host_user.id}>` + 'たんがフェスマッチ募集中でし！\n';
        let members = [];

        if (user1 != null) {
            members.push(`<@${user1.id}>` + 'たん');
        }
        if (user2 != null) {
            members.push(`<@${user2.id}>` + 'たん');
        }

        if (members.length != 0) {
            for (let i in members) {
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
        // const stage_a = 'https://splatoon2.ink/assets/splatnet' + data.regular[type].stage_a.image;
        // const stage_b = 'https://splatoon2.ink/assets/splatnet' + data.regular[type].stage_b.image;
        // const stageImages = [stage_a, stage_b];
        const stageImages = 'dummy';
        const args = 'dummy';
        await sendFesMatch(
            interaction,
            channel,
            team,
            txt,
            recruit_num,
            condition,
            member_counter,
            host_user,
            user1,
            user2,
            args,
            stageImages,
        );
    } catch (error) {
        channel.send('なんかエラーでてるわ');
        console.error(error);
    }
}

async function sendFesMatch(interaction, channel, team, txt, recruit_num, condition, count, host_user, user1, user2, args, stageImages) {
    let r_date = args[0]; // 日付
    let r_time = args[1]; // 時間
    let r_rule = 'ナワバリバトル';
    let r_stage1 = args[3]; // ステージ1
    let r_stage2 = args[4]; // ステージ2

    const mention_id = searchRoleIdByName(interaction.guild, team);

    if (mention_id == null) {
        interaction.editReply({
            content: '設定がおかしいでし！\n「お手数ですがサポートセンターまでご連絡お願いします。」でし！',
            ephemeral: false,
        });
        return;
    }

    const reserve_channel = interaction.options.getChannel('使用チャンネル');

    if (reserve_channel == null) {
        channel_name = '🔉 VC指定なし';
    } else {
        channel_name = '🔉 ' + reserve_channel.name;
    }

    const recruitBuffer = await recruitCanvas(recruit_num, count, host_user, user1, user2, team, condition, channel_name);
    const recruit = new MessageAttachment(recruitBuffer, 'ikabu_recruit.png');

    // const rule = new MessageAttachment(await ruleCanvas(r_rule, r_date, r_time, r_stage1, r_stage2, stageImages), 'rules.png');

    try {
        // const header = await interaction.editReply({ content: txt, files: [recruit, rule], ephemeral: false });
        const header = await interaction.editReply({ content: txt, files: [recruit], ephemeral: false });

        const sentMessage = await interaction.channel.send({
            content: `<@&${mention_id}>` + ' ボタンを押して参加表明するでし！',
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

        await interaction.followUp({
            content: '募集完了でし！参加者が来るまで待つでし！\n15秒間は募集を取り消せるでし！',
            components: reserve_channel != null ? [unlockChannelButton(reserve_channel.id)] : [],
            ephemeral: true,
        });

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
async function recruitCanvas(recruit_num, count, host_user, user1, user2, team, condition, channel_name) {
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

    let fes_icon = await Canvas.loadImage(
        'https://raw.githubusercontent.com/shngmsw/ikabu/fes_recruit-command/images/recruit/fes_icon.png',
    );
    recruit_ctx.drawImage(fes_icon, 9, 17, 105, 90);

    fillTextWithStroke(recruit_ctx, 'フェスマッチ', '51px Splatfont', '#000000', teamColors[teamNames.indexOf(team)], 3, 115, 80);

    recruit_ctx.save();
    recruit_ctx.textAlign = 'right';
    fillTextWithStroke(recruit_ctx, team, '48px Splatfont', teamColors[teamNames.indexOf(team)], '#222222', 1.7, 690, 80);
    recruit_ctx.restore();

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

    if (count >= 3) {
        let user2_img = await Canvas.loadImage(user2_url);
        recruit_ctx.save();
        drawArcImage(recruit_ctx, user2_img, 276, 120, 50);
        recruit_ctx.strokeStyle = '#1e1f23';
        recruit_ctx.lineWidth = 9;
        recruit_ctx.stroke();
        recruit_ctx.restore();
    }

    if (count == 4) {
        let user3_img = await Canvas.loadImage(user3_url);
        recruit_ctx.save();
        drawArcImage(recruit_ctx, user3_img, 394, 120, 50);
        recruit_ctx.strokeStyle = '#1e1f23';
        recruit_ctx.lineWidth = 9;
        recruit_ctx.stroke();
        recruit_ctx.restore();
    }

    let host_icon = await Canvas.loadImage('https://raw.githubusercontent.com/shngmsw/ikabu/main/images/recruit/fes_icon.png');
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
// async function ruleCanvas(r_rule, r_date, r_time, r_stage1, r_stage2, stageImages) {
//     const ruleCanvas = Canvas.createCanvas(720, 550);
//     const rule_ctx = ruleCanvas.getContext('2d');

//     createRoundRect(rule_ctx, 1, 1, 718, 548, 30);
//     rule_ctx.fillStyle = '#2F3136';
//     rule_ctx.fill();
//     rule_ctx.strokeStyle = '#FFFFFF';
//     rule_ctx.lineWidth = 4;
//     rule_ctx.stroke();

//     fillTextWithStroke(rule_ctx, 'ルール', '33px Splatfont', '#FFFFFF', '#2D3130', 1, 35, 80);

//     rule_width = rule_ctx.measureText(r_rule).width;
//     fillTextWithStroke(rule_ctx, r_rule, '45px Splatfont', '#FFFFFF', '#2D3130', 1, (320 - rule_width) / 2, 145); // 中央寄せ

//     fillTextWithStroke(rule_ctx, '日時', '32px Splatfont', '#FFFFFF', '#2D3130', 1, 35, 220);

//     date_width = rule_ctx.measureText(r_date).width;
//     fillTextWithStroke(rule_ctx, r_date, '35px Splatfont', '#FFFFFF', '#2D3130', 1, (350 - date_width) / 2, 270); // 中央寄せ

//     time_width = rule_ctx.measureText(r_time).width;
//     fillTextWithStroke(rule_ctx, r_time, '35px Splatfont', '#FFFFFF', '#2D3130', 1, 15 + (350 - time_width) / 2, 320); // 中央寄せ

//     fillTextWithStroke(rule_ctx, 'ステージ', '33px Splatfont', '#FFFFFF', '#2D3130', 1, 35, 390);

//     stage1_width = rule_ctx.measureText(r_stage1).width;
//     fillTextWithStroke(rule_ctx, r_stage1, '35px Splatfont', '#FFFFFF', '#2D3130', 1, (350 - stage1_width) / 2 + 10, 440); // 中央寄せ

//     stage2_width = rule_ctx.measureText(r_stage2).width;
//     fillTextWithStroke(rule_ctx, r_stage2, '35px Splatfont', '#FFFFFF', '#2D3130', 1, (350 - stage2_width) / 2 + 10, 490); // 中央寄せ

//     let stage1_img = await Canvas.loadImage(stageImages[0]);
//     rule_ctx.save();
//     rule_ctx.beginPath();
//     createRoundRect(rule_ctx, 370, 130, 308, 176, 10);
//     rule_ctx.clip();
//     rule_ctx.drawImage(stage1_img, 370, 130, 308, 176);
//     rule_ctx.strokeStyle = '#FFFFFF';
//     rule_ctx.lineWidth = 6.0;
//     rule_ctx.stroke();
//     rule_ctx.restore();

//     let stage2_img = await Canvas.loadImage(stageImages[1]);
//     rule_ctx.save();
//     rule_ctx.beginPath();
//     createRoundRect(rule_ctx, 370, 340, 308, 176, 10);
//     rule_ctx.clip();
//     rule_ctx.drawImage(stage2_img, 370, 340, 308, 176);
//     rule_ctx.strokeStyle = '#FFFFFF';
//     rule_ctx.lineWidth = 6.0;
//     rule_ctx.stroke();
//     rule_ctx.restore();

//     createRoundRect(rule_ctx, 1, 1, 718, 548, 30);
//     rule_ctx.clip();

//     const rule = ruleCanvas.toBuffer();
//     return rule;
// }

function getFes(data, x) {
    let stage1;
    let stage2;
    let date;
    let time;
    let rule;
    let rstr;

    date = unixTime2ymdw(data.regular[x].start_time);
    time = unixTime2hm(data.regular[x].start_time) + ' – ' + unixTime2hm(data.regular[x].end_time);
    rule = rule2txt(data.regular[x].rule.key);
    stage1 = stage2txt(data.regular[x].stage_a.id);
    stage2 = stage2txt(data.regular[x].stage_b.id);
    rstr = date + ',' + time + ',' + rule + ',' + stage1 + ',' + stage2;
    return rstr;
}
