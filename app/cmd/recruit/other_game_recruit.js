const { MessageEmbed } = require('discord.js');
const { recruitDeleteButton, recruitActionRow } = require('./button_components.js');

module.exports = {
    otherGameRecruit: otherGameRecruit,
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function otherGameRecruit(interaction) {
    // subCommands取得
    if (!interaction.isCommand()) return;

    // 募集がfollowUpでないとリグマと同じfunctionでeditできないため
    await interaction.deferReply();

    const options = interaction.options;

    if (options.getSubcommand() === 'apex') {
        apexLegends(interaction);
    } else if (options.getSubcommand() === 'mhr') {
        monsterHunterRise(interaction);
    } else if (options.getSubcommand() === 'dbd') {
        deadByDayLight(interaction);
    } else if (options.getSubcommand() === 'valo') {
        valorant(interaction);
    } else if (options.getSubcommand() === 'other') {
        others(interaction);
    }
}

function monsterHunterRise(interaction) {
    const role_id = interaction.member.guild.roles.cache.find((role) => role.name === 'ハンター');
    let title = 'MONSTER HUNTER RISE';
    let recruitNumText = interaction.options.getString('募集人数');
    let txt = role_id.toString() + ' 【モンハンライズ募集】\n' + `<@${interaction.member.id}>` + 'たんがモンハンライズ参加者募集中でし！\n';
    let color = '#b71008';
    const image = 'https://raw.githubusercontent.com/shngmsw/ikabu/stg/images/games/MonsterHunterRiseSunBreak.jpg';
    const logo = 'https://raw.githubusercontent.com/shngmsw/ikabu/stg/images/games/MonsterHunterRiseSunBreak_logo.png';
    sendOtherGames(interaction, title, recruitNumText, txt, color, image, logo);
}

function apexLegends(interaction) {
    const role_id = interaction.member.guild.roles.cache.find((role) => role.name === 'レジェンド');
    let title = 'Apex Legends';
    let recruitNumText = interaction.options.getString('募集人数');
    let txt = role_id.toString() + ' 【Apex Legends募集】\n' + `<@${interaction.member.id}>` + 'たんがApexLegendsの参加者募集中でし！\n';
    let color = '#F30100';
    const image = 'https://raw.githubusercontent.com/shngmsw/ikabu/stg/images/games/ApexLegends.jpg';
    const logo = 'https://raw.githubusercontent.com/shngmsw/ikabu/stg/images/games/ApexLegends_logo.png';
    sendOtherGames(interaction, title, recruitNumText, txt, color, image, logo);
}

function deadByDayLight(interaction) {
    const role_id = interaction.member.guild.roles.cache.find((role) => role.name === 'DbD');
    let title = 'Dead by Daylight';
    let recruitNumText = interaction.options.getString('募集人数');
    const txt = role_id.toString() + ' 【Dead by Daylight募集】\n' + `<@${interaction.member.id}>` + 'たんがDbD参加者募集中でし！\n';
    let color = '#84331F';
    const image = 'https://raw.githubusercontent.com/shngmsw/ikabu/stg/images/games/DeadByDaylight.jpg';
    const logo = 'https://raw.githubusercontent.com/shngmsw/ikabu/stg/images/games/deadbydaylight_logo.png';
    sendOtherGames(interaction, title, recruitNumText, txt, color, image, logo);
}

function valorant(interaction) {
    const role_id = interaction.member.guild.roles.cache.find((role) => role.name === 'エージェント');
    let title = 'VALORANT';
    let recruitNumText = interaction.options.getString('募集人数');
    const txt = role_id.toString() + ' 【VALORANT募集】\n' + `<@${interaction.member.id}>` + 'たんがVALORANT参加者募集中でし！\n';
    let color = '#FF4654';
    const image = 'https://raw.githubusercontent.com/shngmsw/ikabu/stg/images/games/valorant.jpg';
    const logo = 'https://raw.githubusercontent.com/shngmsw/ikabu/stg/images/games/valorant_logo.png';
    sendOtherGames(interaction, title, recruitNumText, txt, color, image, logo);
}

function others(interaction) {
    const role_id = interaction.member.guild.roles.cache.find((role) => role.name === '別ゲー');
    let title = interaction.options.getString('ゲームタイトル');
    let recruitNumText = interaction.options.getString('募集人数');
    const txt = role_id.toString() + ` 【${title}募集】\n` + `<@${interaction.member.id}>` + `たんが${title}参加者募集中でし！\n`;
    let color = '#379C30';
    const image = 'https://raw.githubusercontent.com/shngmsw/ikabu/stg/images/games/others.jpg';
    const logo = 'https://raw.githubusercontent.com/shngmsw/ikabu/stg/images/games/others_logo.png';
    sendOtherGames(interaction, title, recruitNumText, txt, color, image, logo);
}

async function sendOtherGames(interaction, title, recruitNumText, txt, color, image, logo) {
    let options = interaction.options;

    let condition = options.getString('内容または参加条件');

    let authorName = interaction.member.nickname == null ? interaction.member.user.username : interaction.member.nickname;
    let authorAvatarUrl = interaction.member.user.avatarURL();

    const embed = new MessageEmbed()
        .setAuthor({
            name: authorName,
            iconURL: authorAvatarUrl,
        })
        .setTitle(title + '募集')
        .setColor(color)
        .addFields([
            {
                name: '募集人数',
                value: recruitNumText,
            },
            {
                name: '参加条件',
                value: condition == null ? 'なし' : condition,
            },
        ])
        .setImage(image)
        .setTimestamp()
        .setThumbnail(logo);

    try {
        const sentMessage = await interaction.followUp({
            content: txt,
            embeds: [embed],
        });
        await interaction.followUp({
            content: '募集完了でし！参加者が来るまで気長に待つでし！\n15秒間は募集を取り消せるでし！',
            ephemeral: true,
        });
        // 募集文を削除してもボタンが動くように、bot投稿メッセージのメッセージIDでボタン作る
        sentMessage.edit({ components: [recruitDeleteButton(sentMessage, interaction.member)] });

        // 15秒後に削除ボタンを消す
        await sleep(15000);
        let cmd_message = await interaction.channel.messages.cache.get(sentMessage.id);
        if (cmd_message != undefined) {
            sentMessage.edit({ components: [recruitActionRow(sentMessage, interaction.member)] });
        } else {
            return;
        }
    } catch (error) {
        console.log(error);
    }
}
