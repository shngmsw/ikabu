const fetch = require('node-fetch');
const common = require('../../common.js');
const { MessageEmbed } = require('discord.js');
const schedule_url = 'https://splatoon2.ink/data/schedules.json';
const coop_schedule_url = 'https://splatoon2.ink/data/coop-schedules.json';

function sendStageInfo(interaction, data, scheduleNum) {
    const l_args = common.getLeague(data, scheduleNum).split(',');
    const g_args = common.getGachi(data, scheduleNum).split(',');
    const l_date = l_args[0];
    const l_rule = l_args[1];
    const l_stage = l_args[2];
    const g_date = g_args[0];
    const g_rule = g_args[1];
    const g_stage = g_args[2];
    var title;
    if (scheduleNum == 0) {
        title = '現在';
    } else {
        title = '次';
    }
    const leagueEmbed = new MessageEmbed()
        .setAuthor({
            name: title + 'のリーグマッチ',
            iconURL: 'https://cdn.glitch.com/4ea6ca87-8ea7-482c-ab74-7aee445ea445%2Fleague.png',
        })
        .setColor(0xf02d7d)
        .addFields({
            name: l_date + '　' + l_rule,
            value: l_stage,
        })
        .setThumbnail('https://cdn.glitch.com/4ea6ca87-8ea7-482c-ab74-7aee445ea445%2Fleague.png');

    const gachiEmbed = new MessageEmbed()
        .setAuthor({
            name: title + 'のガチマッチ',
            iconURL: 'https://cdn.glitch.com/4ea6ca87-8ea7-482c-ab74-7aee445ea445%2Fgachi.png',
        })
        .setColor(0xf34820)
        .addFields({
            name: g_date + '　' + g_rule,
            value: g_stage,
        })
        .setThumbnail('https://cdn.glitch.com/4ea6ca87-8ea7-482c-ab74-7aee445ea445%2Fgachi.png');

    interaction.editReply({
        embeds: [leagueEmbed, gachiEmbed],
    });
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
            const stage_a = 'https://splatoon2.ink/assets/splatnet' + data.regular[0].stage_a.image;
            const stage_b = 'https://splatoon2.ink/assets/splatnet' + data.regular[0].stage_b.image;
            const date = common.unixTime2mdwhm(data.regular[0].start_time) + ' – ' + common.unixTime2mdwhm(data.regular[0].end_time);
            const regular_stage = common.stage2txt(data.regular[0].stage_a.id) + '\n' + common.stage2txt(data.regular[0].stage_b.id) + '\n';

            const nawabariEmbed = new MessageEmbed()
                .setAuthor({
                    name: 'レギュラーマッチ',
                    iconURL: 'https://splatoon2.ink/assets/img/battle-regular.01b5ef.png',
                })
                .setColor(1693465)
                .addFields({
                    name: date,
                    value: regular_stage,
                })
                .setThumbnail('https://splatoon2.ink/assets/img/battle-regular.01b5ef.png');

            interaction.editReply({
                embeds: [nawabariEmbed],
            });
        } else if (subCommand === 'run') {
            try {
                const response = await fetch(coop_schedule_url);
                const data = await response.json();
                const stage = 'https://splatoon2.ink/assets/splatnet' + data.details[0].stage.image;
                const date = common.unixTime2mdwhm(data.details[0].start_time) + ' – ' + common.unixTime2mdwhm(data.details[0].end_time);
                const coop_stage = common.coop_stage2txt(data.details[0].stage.image) + '\n';
                const weapons =
                    common.weapon2txt(data.details[0].weapons[0].id) +
                    '・' +
                    common.weapon2txt(data.details[0].weapons[1].id) +
                    '・' +
                    common.weapon2txt(data.details[0].weapons[2].id) +
                    '・' +
                    common.weapon2txt(data.details[0].weapons[3].id);

                const salmonEmbed = new MessageEmbed()
                    .setAuthor({
                        name: 'SALMON RUN',
                        iconURL: 'https://splatoon2.ink/assets/img/salmon-run-mini.aee5e8.png',
                    })
                    .setTitle(date)
                    .setColor(16733696)
                    .addFields(
                        {
                            name: '支給ブキ',
                            value: weapons,
                        },
                        {
                            name: 'ステージ',
                            value: coop_stage,
                        },
                    )
                    .setImage(stage);

                interaction.editReply({
                    embeds: [salmonEmbed],
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
