const Canvas = require('canvas');
const path = require('path');
const fetch = require('node-fetch');
const app = require('app-root-path').resolve('app');
const { unixTime2mdwhm, coop_stage2txt, weapon2txt } = require(app + '/common.js');
const { createRoundRect, drawArcImage, fillTextWithStroke } = require(app + '/common/canvas_components.js');
const { searchRoleIdByName } = require(app + '/manager/roleManager.js');
const {
    recruitDeleteButton,
    recruitActionRow,
    recruitDeleteButtonWithChannel,
    recruitActionRowWithChannel,
    unlockChannelButton,
} = require(app + '/common/button_components.js');
const { MessageAttachment, Permissions } = require('discord.js');
const coop_schedule_url = 'https://splatoon2.ink/data/coop-schedules.json';

Canvas.registerFont(path.resolve('./fonts/Splatfont.ttf'), {
    family: 'Splatfont',
});
Canvas.registerFont(path.resolve('./fonts/GenShinGothic-P-Medium.ttf'), {
    family: 'Genshin',
});
Canvas.registerFont(path.resolve('./fonts/GenShinGothic-P-Bold.ttf'), {
    family: 'Genshin-Bold',
});
Canvas.registerFont(path.resolve('./fonts/SEGUISYM.TTF'), { family: 'SEGUI' });

module.exports = {
    salmonRecruit: salmonRecruit,
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function salmonRecruit(interaction) {
    if (!interaction.isCommand()) return;

    const options = interaction.options;
    const channel = interaction.channel;
    const voice_channel = interaction.options.getChannel('使用チャンネル');
    let recruit_num = options.getInteger('募集人数');
    let condition = options.getString('参加条件');
    let host_user = interaction.member.user;
    let user1 = options.getUser('参加者1');
    let user2 = options.getUser('参加者2');
    let member_counter = recruit_num; // プレイ人数のカウンター

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

    if (member_counter > 4) {
        await interaction.reply({
            content: '募集人数がおかしいでし！',
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
                content: 'そのチャンネルは指定できないでし！\n🔉alfa ～ 🔉limaの間のチャンネルで指定するでし！',
                ephemeral: true,
            });
            return;
        }
    }

    // 'インタラクションに失敗'が出ないようにするため
    await interaction.deferReply();

    try {
        const response = await fetch(coop_schedule_url);
        const data = await response.json();
        let txt = `<@${host_user.id}>` + 'たんがバイト中でし！\n';

        if (user1 != null && user2 != null) {
            txt = txt + `<@${user1.id}>` + 'たんと' + `<@${user2.id}>` + 'たんの参加が既に決定しているでし！';
        } else if (user1 != null) {
            txt = txt + `<@${user1.id}>` + 'たんの参加が既に決定しているでし！';
        } else if (user2 != null) {
            txt = txt + `<@${user2.id}>` + 'たんの参加が既に決定しているでし！';
        }

        txt += 'よければ合流しませんか？';

        if (condition == null) condition = 'なし';

        await sendSalmonRun(interaction, channel, txt, recruit_num, condition, member_counter, host_user, user1, user2, data.details[0]);
    } catch (error) {
        channel.send('なんかエラーでてるわ');
        console.error(error);
    }
}

async function sendSalmonRun(interaction, channel, txt, recruit_num, condition, count, host_user, user1, user2, detail) {
    let date = unixTime2mdwhm(detail.start_time) + ' – ' + unixTime2mdwhm(detail.end_time);
    let coop_stage = coop_stage2txt(detail.stage.image);
    let weapon1 = weapon2txt(detail.weapons[0].id);
    let weapon2 = weapon2txt(detail.weapons[1].id);
    let weapon3 = weapon2txt(detail.weapons[2].id);
    let weapon4 = weapon2txt(detail.weapons[3].id);
    let stageImage = 'https://splatoon2.ink/assets/splatnet' + detail.stage.image;

    const reserve_channel = interaction.options.getChannel('使用チャンネル');

    if (reserve_channel == null) {
        channel_name = '🔉 VC指定なし';
    } else {
        channel_name = '🔉 ' + reserve_channel.name;
    }

    const recruitBuffer = await recruitCanvas(recruit_num, count, host_user, user1, user2, condition, channel_name);
    const recruit = new MessageAttachment(recruitBuffer, 'ikabu_recruit.png');

    const rule = new MessageAttachment(await ruleCanvas(date, coop_stage, weapon1, weapon2, weapon3, weapon4, stageImage), 'schedule.png');

    try {
        const mention_id = searchRoleIdByName(interaction.guild, 'サーモン');
        const mention = `<@&${mention_id}>`;
        // const header = await interaction.editReply({
        //     content: txt,
        //     files: [recruit, rule],
        //     ephemeral: false,
        // });
        const header = await interaction.editReply({ content: txt, files: [recruit], ephemeral: false });
        const sentMessage = await interaction.channel.send({
            content: mention + ' ボタンを押して参加表明するでし！',
        });

        // 募集文を削除してもボタンが動くように、bot投稿メッセージのメッセージIDでボタン作る
        if (reserve_channel == null) {
            sentMessage.edit({
                components: [recruitDeleteButton(sentMessage, header)],
            });
        } else {
            sentMessage.edit({
                components: [recruitDeleteButtonWithChannel(sentMessage, reserve_channel.id, header)],
            });
            reserve_channel.permissionOverwrites.set(
                [
                    {
                        id: interaction.guild.roles.everyone.id,
                        deny: [Permissions.FLAGS.CONNECT],
                    },
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
                sentMessage.edit({
                    components: [recruitActionRowWithChannel(reserve_channel.id, header)],
                });
            }
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

    let salmon_icon = await Canvas.loadImage('https://cdn.wikimg.net/en/splatoonwiki/images/7/76/S3_art_3D_Little_buddy.png');
    recruit_ctx.drawImage(salmon_icon, 20, 15, 85, 105);

    fillTextWithStroke(recruit_ctx, 'SALMON', '51px Splatfont', '#000000', '#FF9900', 3, 115, 80);
    fillTextWithStroke(recruit_ctx, 'RUN', '51px Splatfont', '#000000', '#00FF00DA', 3, 350, 80);

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
async function ruleCanvas(date, stage, weapon1, weapon2, weapon3, weapon4, stageImage) {
    const ruleCanvas = Canvas.createCanvas(720, 550);
    const rule_ctx = ruleCanvas.getContext('2d');

    createRoundRect(rule_ctx, 1, 1, 718, 548, 30);
    rule_ctx.fillStyle = '#2F3136';
    rule_ctx.fill();
    rule_ctx.strokeStyle = '#FFFFFF';
    rule_ctx.lineWidth = 4;
    rule_ctx.stroke();

    fillTextWithStroke(rule_ctx, '日時', '32px Splatfont', '#FFFFFF', '#2D3130', 1, 35, 80);

    date_width = rule_ctx.measureText(date).width;
    fillTextWithStroke(rule_ctx, date, '37px Splatfont', '#FFFFFF', '#2D3130', 1, (650 - date_width) / 2, 145);

    fillTextWithStroke(rule_ctx, '武器', '32px Splatfont', '#FFFFFF', '#2D3130', 1, 35, 245);

    rule_ctx.save();
    if (weapon1 === '❓') {
        weapon1 = '？';
        rule_ctx.font = '41px "Splatfont"';
        rule_ctx.fillStyle = '#FFDB26';
    } else if (weapon1 === '？') {
        rule_ctx.font = '41px "Splatfont"';
        rule_ctx.fillStyle = '#00BE63';
    } else {
        rule_ctx.font = '33px "Splatfont"';
        rule_ctx.fillStyle = '#FFFFFF';
    }
    weapons1_width = rule_ctx.measureText(weapon1).width;
    rule_ctx.fillText(weapon1, (350 - weapons1_width) / 2, 310);
    rule_ctx.strokeStyle = '#2D3130';
    rule_ctx.lineWidth = 1.0;
    rule_ctx.strokeText(weapon1, (350 - weapons1_width) / 2, 310);
    rule_ctx.restore();

    rule_ctx.save();
    if (weapon2 === '❓') {
        weapon2 = '？';
        rule_ctx.font = '41px "Splatfont"';
        rule_ctx.fillStyle = '#FFDB26';
    } else if (weapon2 === '？') {
        rule_ctx.font = '41px "Splatfont"';
        rule_ctx.fillStyle = '#00BE63';
    } else {
        rule_ctx.font = '33px "Splatfont"';
        rule_ctx.fillStyle = '#FFFFFF';
    }
    weapons2_width = rule_ctx.measureText(weapon2).width;
    rule_ctx.fillText(weapon2, (350 - weapons2_width) / 2, 375);
    rule_ctx.strokeStyle = '#2D3130';
    rule_ctx.lineWidth = 1.0;
    rule_ctx.strokeText(weapon2, (350 - weapons2_width) / 2, 375);
    rule_ctx.restore();

    rule_ctx.save();
    if (weapon3 === '❓') {
        weapon3 = '？';
        rule_ctx.font = '41px "Splatfont"';
        rule_ctx.fillStyle = '#FFDB26';
    } else if (weapon3 === '？') {
        rule_ctx.font = '41px "Splatfont"';
        rule_ctx.fillStyle = '#00BE63';
    } else {
        rule_ctx.font = '33px "Splatfont"';
        rule_ctx.fillStyle = '#FFFFFF';
    }
    weapons3_width = rule_ctx.measureText(weapon3).width;
    rule_ctx.fillText(weapon3, (350 - weapons3_width) / 2, 440);
    rule_ctx.strokeStyle = '#2D3130';
    rule_ctx.lineWidth = 1.0;
    rule_ctx.strokeText(weapon3, (350 - weapons3_width) / 2, 440);
    rule_ctx.restore();

    rule_ctx.save();
    if (weapon4 === '❓') {
        weapon4 = '？';
        rule_ctx.font = '41px "Splatfont"';
        rule_ctx.fillStyle = '#FFDB26';
    } else if (weapon4 === '？') {
        rule_ctx.font = '41px "Splatfont"';
        rule_ctx.fillStyle = '#00BE63';
    } else {
        rule_ctx.font = '33px "Splatfont"';
        rule_ctx.fillStyle = '#FFFFFF';
    }
    weapons4_width = rule_ctx.measureText(weapon4).width;
    rule_ctx.fillText(weapon4, (350 - weapons4_width) / 2, 505);
    rule_ctx.strokeStyle = '#2D3130';
    rule_ctx.lineWidth = 1.0;
    rule_ctx.strokeText(weapon4, (350 - weapons4_width) / 2, 505);
    rule_ctx.restore();

    fillTextWithStroke(rule_ctx, 'ステージ', '33px Splatfont', '#FFFFFF', '#2D3130', 1, 350, 245);

    stage_width = rule_ctx.measureText(stage).width;
    fillTextWithStroke(rule_ctx, stage, '38px Splatfont', '#FFFFFF', '#2D3130', 1, 150 + (700 - stage_width) / 2, 300);

    let stage_img = await Canvas.loadImage(stageImage);
    rule_ctx.save();
    rule_ctx.beginPath();
    createRoundRect(rule_ctx, 370, 340, 308, 176, 10);
    rule_ctx.clip();
    rule_ctx.drawImage(stage_img, 370, 340, 308, 176);
    rule_ctx.strokeStyle = '#FFFFFF';
    rule_ctx.lineWidth = 6.0;
    rule_ctx.stroke();
    rule_ctx.restore();

    createRoundRect(rule_ctx, 1, 1, 718, 548, 30);
    rule_ctx.clip();

    const rule = ruleCanvas.toBuffer();
    return rule;
}
