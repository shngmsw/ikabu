const Canvas = require('canvas');
const fetch = require('node-fetch');
const app = require('app-root-path').resolve('app');
const common = require(app + '/common.js');
const { createRoundRect, fillTextWithStroke } = require(app + '/common/canvas_components.js');
const { sp3unixTime2mdwhm, coop_stage3txt } = require(app + '/common.js');
const { MessageEmbed, MessageAttachment } = require('discord.js');
const schedule_url = 'https://splatoon3.ink/data/schedules.json';
const coop_schedule_url = 'https://splatoon3.ink/data/schedules.json';

function sendStageInfo(interaction, data, scheduleNum) {
    const l_args = common.getLeague(data.data.leagueSchedules.nodes, scheduleNum).split(',');
    const c_args = common.getChallenge(data.data.bankaraSchedules.nodes, scheduleNum).split(',');
    const o_args = common.getOpen(data.data.bankaraSchedules.nodes, scheduleNum).split(',');
    const x_args = common.getXMatch(data.data.xSchedules.nodes, scheduleNum).split(',');
    const l_date = l_args[0];
    const l_rule = l_args[1];
    const l_stage = l_args[2];
    const l_thumbnail = rule2image(l_rule);
    const c_date = c_args[0];
    const c_rule = c_args[1];
    const c_stage = c_args[2];
    const c_thumbnail = rule2image(c_rule);
    const o_date = o_args[0];
    const o_rule = o_args[1];
    const o_stage = o_args[2];
    const o_thumbnail = rule2image(o_rule);
    const x_date = x_args[0];
    const x_rule = x_args[1];
    const x_stage = x_args[2];
    const x_thumbnail = rule2image(x_rule);
    var title;
    if (scheduleNum == 0) {
        title = '現在';
    } else {
        title = '次';
    }
    const leagueEmbed = new MessageEmbed()
        .setAuthor({
            name: title + 'のリーグマッチ',
            iconURL: 'https://raw.githubusercontent.com/shngmsw/ikabu/main/images/recruit/league_icon.png',
        })
        .setColor('#ED2D7C')
        .addFields({
            name: l_date + '　' + l_rule,
            value: l_stage,
        })
        .setThumbnail(l_thumbnail);

    const challengeEmbed = new MessageEmbed()
        .setAuthor({
            name: title + 'のバンカラマッチ (チャレンジ)',
            iconURL: 'https://raw.githubusercontent.com/shngmsw/ikabu/main/images/recruit/anarchy_icon.png',
        })
        .setColor('#F54910')
        .addFields({
            name: c_date + '　' + c_rule,
            value: c_stage,
        })
        .setThumbnail(c_thumbnail);

    const openEmbed = new MessageEmbed()
        .setAuthor({
            name: title + 'のバンカラマッチ (オープン)',
            iconURL: 'https://raw.githubusercontent.com/shngmsw/ikabu/main/images/recruit/anarchy_icon.png',
        })
        .setColor('#F54910')
        .addFields({
            name: o_date + '　' + o_rule,
            value: o_stage,
        })
        .setThumbnail(o_thumbnail);

    const xMatchEmbed = new MessageEmbed()
        .setAuthor({
            name: title + 'のXマッチ',

            iconURL: 'https://raw.githubusercontent.com/shngmsw/ikabu/main/images/recruit/x_match_icon.png',
        })
        .setColor('#0edb9b')
        .addFields({
            name: x_date + '　' + x_rule,
            value: x_stage,
        })
        .setThumbnail(x_thumbnail);

    interaction.editReply({
        embeds: [openEmbed, challengeEmbed],
    });
    // TODO: リーグマッチとXマッチはゲーム内で実装後に表示
    // interaction.editReply({
    //     embeds: [leagueEmbed, openEmbed, challengeEmbed, xMatchEmbed],
    // });
}

module.exports = async function handleShow(interaction) {
    try {
        if (!interaction.isCommand()) return;
        // 'インタラクションに失敗'が出ないようにするため
        await interaction.deferReply();
        const { options } = interaction;
        const subCommand = options.getSubcommand();
        const response = await fetch(schedule_url);
        const data = await response.json();
        if (subCommand === `now`) {
            sendStageInfo(interaction, data, 0);
        } else if (subCommand === 'next') {
            sendStageInfo(interaction, data, 1);
        } else if (subCommand === 'nawabari') {
            const response = await fetch(schedule_url);
            const data = await response.json();
            const args = common.getRegular(data, 0).split(',');

            const nawabariEmbed = new MessageEmbed()
                .setAuthor({
                    name: 'レギュラーマッチ',
                    iconURL: 'https://raw.githubusercontent.com/shngmsw/ikabu/main/images/recruit/regular_icon.png',
                })
                .setColor('#B3FF00')
                .addFields({
                    name: args[0] + ' ' + args[1],
                    value: args[3] + '／' + args[4],
                })
                .setThumbnail('https://raw.githubusercontent.com/shngmsw/ikabu/main/images/recruit/regular_icon.png');

            interaction.editReply({
                embeds: [nawabariEmbed],
            });
        } else if (subCommand === 'run') {
            try {
                const response = await fetch(coop_schedule_url);
                const data = await response.json();
                const salmon_data = data.data.coopGroupingSchedule.regularSchedules.nodes[0];
                const coopSetting = salmon_data.setting;
                let date = sp3unixTime2mdwhm(salmon_data.startTime) + ' – ' + sp3unixTime2mdwhm(salmon_data.endTime);
                let coop_stage = coop_stage3txt(coopSetting.coopStage.coopStageId);
                let weapon1 = coopSetting.weapons[0].image.url;
                let weapon2 = coopSetting.weapons[1].image.url;
                let weapon3 = coopSetting.weapons[2].image.url;
                let weapon4 = coopSetting.weapons[3].image.url;
                let weaponsImage = new MessageAttachment(await salmonWeaponCanvas(weapon1, weapon2, weapon3, weapon4), 'weapons.png');
                let stageImage = coopSetting.coopStage.thumbnailImage.url;

                const salmonEmbed = new MessageEmbed()
                    .setAuthor({
                        name: 'SALMON RUN',
                        iconURL: 'https://raw.githubusercontent.com/shngmsw/ikabu/main/images/recruit/salmon_black_icon.png',
                    })
                    .setTitle(date)
                    .setColor('#ff5500')
                    .addFields({
                        name: 'ステージ',
                        value: coop_stage,
                    })
                    .setImage(stageImage)
                    .setThumbnail('https://raw.githubusercontent.com/shngmsw/ikabu/main/images/recruit/salmon_black_icon.png');

                interaction.editReply({
                    embeds: [salmonEmbed],
                });
                interaction.channel.send({
                    files: [weaponsImage],
                });
            } catch (error) {
                interaction.followUp('なんかエラーでてるわ');
                console.error(error);
            }
        }
    } catch (error) {
        interaction.followUp('なんかエラーでてるわ');
        console.error(error);
    }
};

/*
 * ルール情報のキャンバス(2枚目)を作成する
 */
async function salmonWeaponCanvas(weapon1, weapon2, weapon3, weapon4) {
    const canvas_width = 650;
    const canvas_height = 220;
    const weaponCanvas = Canvas.createCanvas(canvas_width, canvas_height);
    const weapon_ctx = weaponCanvas.getContext('2d');

    createRoundRect(weapon_ctx, 1, 1, canvas_width - 2, canvas_height - 2, 0);
    weapon_ctx.fillStyle = '#2F3136';
    weapon_ctx.fill();

    fillTextWithStroke(weapon_ctx, '武器', '32px Splatfont', '#FFFFFF', '#2D3130', 1, 35, 45);

    let weapon1_img = await Canvas.loadImage(weapon1);
    let weapon1_dx = 80;
    let weapon_dy = 70;
    weapon_ctx.drawImage(weapon1_img, weapon1_dx, weapon_dy, 110, 110);

    let weapon2_img = await Canvas.loadImage(weapon2);
    weapon_ctx.drawImage(weapon2_img, weapon1_dx + 140, weapon_dy, 110, 110);

    let weapon3_img = await Canvas.loadImage(weapon3);
    weapon_ctx.drawImage(weapon3_img, weapon1_dx + 280, weapon_dy, 110, 110);

    let weapon4_img = await Canvas.loadImage(weapon4);
    weapon_ctx.drawImage(weapon4_img, weapon1_dx + 420, weapon_dy, 110, 110);

    createRoundRect(weapon_ctx, 1, 1, canvas_width - 2, canvas_height - 2, 30);
    weapon_ctx.clip();

    return weaponCanvas.toBuffer();
}

function rule2image(rule) {
    switch (rule) {
        case 'ガチエリア':
            return 'https://cdn.glitch.com/4ea6ca87-8ea7-482c-ab74-7aee445ea445%2Fobject_area.png';
        case 'ガチヤグラ':
            return 'https://cdn.glitch.com/4ea6ca87-8ea7-482c-ab74-7aee445ea445%2Fobject_yagura.png';
        case 'ガチホコバトル':
            return 'https://cdn.glitch.com/4ea6ca87-8ea7-482c-ab74-7aee445ea445%2Fobject_hoko.png';
        case 'ガチアサリ':
            return 'https://cdn.glitch.com/4ea6ca87-8ea7-482c-ab74-7aee445ea445%2Fobject_asari.png';
    }
}
