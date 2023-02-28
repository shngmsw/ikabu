const Canvas = require('canvas');
const { createRoundRect, fillTextWithStroke } = require('../../common/canvas_components');
const { EmbedBuilder, AttachmentBuilder } = require('discord.js');
const { formatDatetime, dateformat } = require('../../common/convert_datetime.js');
const { getUnixTime } = require('date-fns');

const log4js = require('log4js');
const {
    fetchSchedule,
    checkFes,
    getFesData,
    getRegularData,
    getSalmonData,
    getLeagueData,
    getAnarchyChallengeData,
    getAnarchyOpenData,
    getXMatchData,
} = require('../../common/apis/splatoon3_ink');

log4js.configure(process.env.LOG4JS_CONFIG_PATH);
const logger = log4js.getLogger('interaction');

module.exports = async function handleShow(interaction) {
    try {
        if (!interaction.isCommand()) return;
        // 'インタラクションに失敗'が出ないようにするため
        await interaction.deferReply();
        const { options } = interaction;
        const subCommand = options.getSubcommand();
        const data = await fetchSchedule();
        if (subCommand === `now`) {
            if (checkFes(data.schedule, 0)) {
                await sendFesInfo(interaction, data, 0);
            } else {
                await sendStageInfo(interaction, data, 0);
            }
        } else if (subCommand === 'next') {
            if (checkFes(data.schedule, 1)) {
                await sendFesInfo(interaction, data, 1);
            } else {
                await sendStageInfo(interaction, data, 1);
            }
        } else if (subCommand === 'nawabari') {
            if (checkFes(data.schedule, 1)) {
                await sendFesInfo(interaction, data, 0);
            } else {
                await sendRegularInfo(interaction, data, 0);
            }
        } else if (subCommand === 'run') {
            await sendRunInfo(interaction, data);
        }
    } catch (error) {
        await interaction.followUp('なんかエラーでてるわ');
        logger.error(error);
    }
};

async function sendStageInfo(interaction, data, scheduleNum) {
    var title;
    if (scheduleNum == 0) {
        title = '現在';
    } else {
        title = '次';
    }

    // const league_data = await getLeagueData(data, scheduleNum);
    const challenge_data = await getAnarchyChallengeData(data, scheduleNum);
    const open_data = await getAnarchyOpenData(data, scheduleNum);
    const X_data = await getXMatchData(data, scheduleNum);

    // const l_thumbnail = rule2image(league_data.rule);
    const c_thumbnail = rule2image(challenge_data.rule);
    const o_thumbnail = rule2image(open_data.rule);
    const x_thumbnail = rule2image(X_data.rule);

    // const league_start_date = formatDatetime(league_data.startTime, dateformat.ymdwhm);
    // const league_end_date = formatDatetime(league_data.endTime, dateformat.hm);
    // const leagueEmbed = new EmbedBuilder()
    //     .setAuthor({
    //         name: title + 'のリーグマッチ',
    //         iconURL: 'https://raw.githubusercontent.com/shngmsw/ikabu/main/images/recruit/league_icon.png',
    //     })
    //     .setColor('#ED2D7C')
    //     .addFields({
    //         name: league_start_date + '-' + league_end_date,
    //         value: league_data.stage1 + '／' + league_data.stage2,
    //     })
    //     .setThumbnail(l_thumbnail);

    const challenge_start_date = formatDatetime(challenge_data.startTime, dateformat.ymdwhm);
    const challenge_end_date = formatDatetime(challenge_data.endTime, dateformat.hm);
    const challengeEmbed = new EmbedBuilder()
        .setAuthor({
            name: title + 'のバンカラマッチ (チャレンジ)',
            iconURL: 'https://raw.githubusercontent.com/shngmsw/ikabu/main/images/recruit/anarchy_icon.png',
        })
        .setColor('#F54910')
        .addFields({
            name: challenge_start_date + '-' + challenge_end_date,
            value: challenge_data.stage1 + '／' + challenge_data.stage2,
        })
        .setThumbnail(c_thumbnail);

    const open_start_date = formatDatetime(open_data.startTime, dateformat.ymdwhm);
    const open_end_date = formatDatetime(open_data.endTime, dateformat.hm);
    const openEmbed = new EmbedBuilder()
        .setAuthor({
            name: title + 'のバンカラマッチ (オープン)',
            iconURL: 'https://raw.githubusercontent.com/shngmsw/ikabu/main/images/recruit/anarchy_icon.png',
        })
        .setColor('#F54910')
        .addFields({
            name: open_start_date + '-' + open_end_date,
            value: open_data.stage1 + '／' + open_data.stage2,
        })
        .setThumbnail(o_thumbnail);

    const x_start_date = formatDatetime(X_data.startTime, dateformat.ymdwhm);
    const x_end_date = formatDatetime(X_data.endTime, dateformat.hm);
    const xMatchEmbed = new EmbedBuilder()
        .setAuthor({
            name: title + 'のXマッチ',

            iconURL: 'https://raw.githubusercontent.com/shngmsw/ikabu/main/images/recruit/x_match_icon.png',
        })
        .setColor('#0edb9b')
        .addFields({
            name: x_start_date + '-' + x_end_date,
            value: X_data.stage1 + '／' + X_data.stage2,
        })
        .setThumbnail(x_thumbnail);

    await interaction.editReply({
        embeds: [xMatchEmbed, challengeEmbed, openEmbed],
    });
    // TODO: リーグマッチはゲーム内で実装後に表示
    // await interaction.editReply({
    //     embeds: [leagueEmbed, openEmbed, challengeEmbed, xMatchEmbed],
    // });
}

async function sendRegularInfo(interaction, data, scheduleNum) {
    const regular_data = await getRegularData(data, scheduleNum);
    const start_date = formatDatetime(regular_data.startTime, dateformat.ymdwhm);
    const end_date = formatDatetime(regular_data.endTime, dateformat.hm);

    if (scheduleNum == 0) {
        title = '現在';
    } else {
        title = '次';
    }

    const regularEmbed = new EmbedBuilder()
        .setAuthor({
            name: title + 'のレギュラーマッチ',
            iconURL: 'https://raw.githubusercontent.com/shngmsw/ikabu/main/images/recruit/regular_icon.png',
        })
        .setColor('#B3FF00')
        .addFields({
            name: start_date + '-' + end_date,
            value: regular_data.stage1 + '／' + regular_data.stage2,
        })
        .setThumbnail('https://raw.githubusercontent.com/shngmsw/ikabu/main/images/recruit/regular_icon.png');

    await interaction.editReply({
        embeds: [regularEmbed],
    });
}

async function sendFesInfo(interaction, data, scheduleNum) {
    const fes_data = await getFesData(data, scheduleNum);
    const start_date = formatDatetime(fes_data.startTime, dateformat.ymdwhm);
    const end_date = formatDatetime(fes_data.endTime, dateformat.hm);

    if (scheduleNum == 0) {
        title = '現在';
    } else {
        title = '次';
    }

    const fesEmbed = new EmbedBuilder()
        .setAuthor({
            name: title + 'のフェスマッチ',
            iconURL: 'https://raw.githubusercontent.com/shngmsw/ikabu/main/images/recruit/fes_icon.png',
        })
        .setColor('#ead147')
        .addFields({
            name: start_date + '-' + end_date,
            value: fes_data.stage1 + '／' + fes_data.stage2,
        })
        .setThumbnail('https://raw.githubusercontent.com/shngmsw/ikabu/main/images/recruit/fes_icon.png');

    await interaction.editReply({
        embeds: [fesEmbed],
    });
}

async function sendRunInfo(interaction, data) {
    try {
        for (let i = 0; i < 2; i++) {
            if (i == 0) {
                title = '現在';
            } else if (i == 1) {
                title = '次';
            }
            const salmon_data = await getSalmonData(data, i);
            const start_date = formatDatetime(salmon_data.startTime, dateformat.ymdwhm);
            const end_date = formatDatetime(salmon_data.endTime, dateformat.ymdwhm);

            let weaponsImage = new AttachmentBuilder(
                await salmonWeaponCanvas(salmon_data.weapon1, salmon_data.weapon2, salmon_data.weapon3, salmon_data.weapon4),
                {
                    name: 'weapons.png',
                    description: '',
                },
            );

            const salmonEmbed = new EmbedBuilder()
                .setAuthor({
                    name: title + 'のSALMON RUN',
                    iconURL: 'https://raw.githubusercontent.com/shngmsw/ikabu/main/images/recruit/salmon_black_icon.png',
                })
                .setTitle(salmon_data.stage)
                .setColor('#FC892C')
                .addFields(
                    {
                        name: '開始日時',
                        value: start_date + '【' + `<t:${getUnixTime(new Date(salmon_data.startTime))}:R>` + '】',
                    },
                    {
                        name: '終了日時',
                        value: end_date + '【' + `<t:${getUnixTime(new Date(salmon_data.endTime))}:R>` + '】',
                    },
                )
                .setImage('attachment://weapons.png')
                .setThumbnail('https://raw.githubusercontent.com/shngmsw/ikabu/main/images/recruit/salmon_black_icon.png');

            if (i == 0) {
                await interaction.editReply({
                    embeds: [salmonEmbed],
                    files: [weaponsImage],
                });
            } else {
                await interaction.channel.send({
                    embeds: [salmonEmbed],
                    files: [weaponsImage],
                });
            }
        }
    } catch (error) {
        await interaction.followUp('なんかエラーでてるわ');
        logger.error(error);
    }
}

/*
 * ルール情報のキャンバス(2枚目)を作成する
 */
async function salmonWeaponCanvas(weapon1, weapon2, weapon3, weapon4) {
    const canvas_width = 650;
    const canvas_height = 220;
    const weaponCanvas = Canvas.createCanvas(canvas_width, canvas_height);
    const weapon_ctx = weaponCanvas.getContext('2d');

    createRoundRect(weapon_ctx, 1, 1, canvas_width - 2, canvas_height - 2, 0);
    weapon_ctx.fillStyle = '#2F313600';
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
        default:
            return 'http://placehold.jp/15/4c4d57/ffffff/100x100.png?text=ここに画像を貼りたかったんだが、どうやらエラーみたいだ…。';
    }
}
