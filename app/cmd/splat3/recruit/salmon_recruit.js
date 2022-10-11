const Canvas = require('canvas');
const path = require('path');
const fetch = require('node-fetch');
const { searchMessageById } = require('../../../manager/messageManager');
const { searchMemberById } = require('../../../manager/memberManager');
const { isNotEmpty, sp3unixTime2mdwhm, sp3coop_stage2txt } = require('../../../common');
const { createRoundRect, drawArcImage, fillTextWithStroke } = require('../../../common/canvas_components');
const { recruitActionRow, recruitDeleteButton, unlockChannelButton } = require('../../../common/button_components');
const { AttachmentBuilder, PermissionsBitField } = require('discord.js');
const coop_schedule_url = 'https://splatoon3.ink/data/schedules.json';

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
    const guild = await interaction.guild.fetch();
    const host_member = await searchMemberById(guild, interaction.member.user.id);
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
        if (voice_channel.members.size != 0 && !voice_channel.members.has(host_member.user.id)) {
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
        const response = await fetch(coop_schedule_url);
        const data = await response.json();
        let txt = `<@${host_member.user.id}>` + 'たんがバイト中でし！\n';

        if (user1 != null && user2 != null) {
            txt = txt + `<@${user1.id}>` + 'たんと' + `<@${user2.id}>` + 'たんの参加が既に決定しているでし！';
        } else if (user1 != null) {
            txt = txt + `<@${user1.id}>` + 'たんの参加が既に決定しているでし！';
        } else if (user2 != null) {
            txt = txt + `<@${user2.id}>` + 'たんの参加が既に決定しているでし！';
        }

        txt += 'よければ合流しませんか？';

        if (condition == null) condition = 'なし';

        await sendSalmonRun(
            interaction,
            channel,
            txt,
            recruit_num,
            condition,
            member_counter,
            host_member,
            user1,
            user2,
            data.data.coopGroupingSchedule.regularSchedules.nodes[0],
        );
    } catch (error) {
        channel.send('なんかエラーでてるわ');
        console.error(error);
    }
}

async function sendSalmonRun(interaction, channel, txt, recruit_num, condition, count, host_member, user1, user2, detail) {
    const coopSetting = detail.setting;
    let date = sp3unixTime2mdwhm(detail.startTime) + ' – ' + sp3unixTime2mdwhm(detail.endTime);
    let coop_stage = sp3coop_stage2txt(coopSetting.coopStage.coopStageId);
    let weapon1 = coopSetting.weapons[0].image.url;
    let weapon2 = coopSetting.weapons[1].image.url;
    let weapon3 = coopSetting.weapons[2].image.url;
    let weapon4 = coopSetting.weapons[3].image.url;
    let stageImage = coopSetting.coopStage.thumbnailImage.url;

    const reserve_channel = interaction.options.getChannel('使用チャンネル');

    if (reserve_channel == null) {
        channel_name = '🔉 VC指定なし';
    } else {
        channel_name = '🔉 ' + reserve_channel.name;
    }

    const guild = await interaction.guild.fetch();
    // サーバーメンバーとして取得し直し
    if (user1 != null) {
        user1 = await searchMemberById(guild, user1.id);
    }
    if (user2 != null) {
        user2 = await searchMemberById(guild, user2.id);
    }

    const recruitBuffer = await recruitCanvas(recruit_num, count, host_member, user1, user2, condition, channel_name);
    const recruit = new AttachmentBuilder(recruitBuffer, 'ikabu_recruit.png');

    const rule = new AttachmentBuilder(await ruleCanvas(date, coop_stage, weapon1, weapon2, weapon3, weapon4, stageImage), 'schedule.png');

    try {
        const mention = `@everyone`;
        const header = await interaction.editReply({
            content: txt,
            files: [recruit, rule],
            ephemeral: false,
        });
        const sentMessage = await interaction.channel.send({
            content: mention + ' ボタンを押して参加表明するでし！',
        });

        let isLock = false;
        // 募集文を削除してもボタンが動くように、bot投稿メッセージのメッセージIDでボタン作る
        if (reserve_channel != null && interaction.member.voice.channelId != reserve_channel.id) {
            isLock = true;
        }

        let deleteButtonMsg;
        if (isLock) {
            sentMessage.edit({ components: [recruitActionRow(header, reserve_channel.id)] });
            deleteButtonMsg = await interaction.channel.send({
                components: [recruitDeleteButton(sentMessage, header, reserve_channel.id)],
            });
            reserve_channel.permissionOverwrites.set(
                [
                    { id: guild.roles.everyone.id, deny: [PermissionsBitField.Flags.Connect] },
                    { id: host_member.user.id, allow: [PermissionsBitField.Flags.Connect] },
                ],
                'Reserve Voice Channel',
            );

            await interaction.followUp({
                content: '募集完了でし！参加者が来るまで待つでし！\n15秒間は募集を取り消せるでし！',
                components: [unlockChannelButton(reserve_channel.id)],
                ephemeral: true,
            });
        } else {
            sentMessage.edit({ components: [recruitActionRow(header)] });
            deleteButtonMsg = await interaction.channel.send({
                components: [recruitDeleteButton(sentMessage, header)],
            });
            await interaction.followUp({
                content: '募集完了でし！参加者が来るまで待つでし！\n15秒間は募集を取り消せるでし！',
                ephemeral: true,
            });
        }

        // 15秒後に削除ボタンを消す
        await sleep(15000);
        const deleteButtonCheck = await searchMessageById(guild, interaction.channel.id, deleteButtonMsg.id);
        if (isNotEmpty(deleteButtonCheck)) {
            deleteButtonCheck.delete();
        }

        // 2時間後にVCロックを解除する
        await sleep(7200000 - 15000);
        if (isLock) {
            reserve_channel.permissionOverwrites.delete(guild.roles.everyone, 'UnLock Voice Channel');
            reserve_channel.permissionOverwrites.delete(host_member.user, 'UnLock Voice Channel');
        }
    } catch (error) {
        console.log(error);
    }
}

/*
 * 募集用のキャンバス(1枚目)を作成する
 */
async function recruitCanvas(recruit_num, count, host_member, user1, user2, condition, channel_name) {
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

    let salmon_icon = await Canvas.loadImage('https://raw.githubusercontent.com/shngmsw/ikabu/main/images/recruit/salmon_black_icon.png');
    recruit_ctx.drawImage(salmon_icon, 22, 32, 82, 60);

    fillTextWithStroke(recruit_ctx, 'SALMON', '51px Splatfont', '#000000', '#FF9900', 3, 115, 80);
    fillTextWithStroke(recruit_ctx, 'RUN', '51px Splatfont', '#000000', '#00FF00DA', 3, 350, 80);

    // 募集主の画像
    let host_img = await Canvas.loadImage(host_member.displayAvatarURL({ extension: 'png' }));
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
        user1_url = user1.displayAvatarURL({ extension: 'png' });
        user2_url = user2.displayAvatarURL({ extension: 'png' });
    } else if (user1 != null && user2 == null) {
        user1_url = user1.displayAvatarURL({ extension: 'png' });
    } else if (user1 == null && user2 != null) {
        user1_url = user2.displayAvatarURL({ extension: 'png' });
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

    let weapon1_img = await Canvas.loadImage(weapon1);
    rule_ctx.drawImage(weapon1_img, 50, 280, 110, 110);

    let weapon2_img = await Canvas.loadImage(weapon2);
    rule_ctx.drawImage(weapon2_img, 190, 280, 110, 110);

    let weapon3_img = await Canvas.loadImage(weapon3);
    rule_ctx.drawImage(weapon3_img, 50, 410, 110, 110);

    let weapon4_img = await Canvas.loadImage(weapon4);
    rule_ctx.drawImage(weapon4_img, 190, 410, 110, 110);

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
