const { MessageEmbed, MessageActionRow, MessageButton } = require('discord.js');
const { URLSearchParams } = require('url');

module.exports = {
    otherGameRecruit: otherGameRecruit,
};

function otherGameRecruit(interaction) {
    // subCommands取得
    if (!interaction.isCommand()) return;

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
    let txt = role_id.toString() + ' 【モンハンライズ募集】\n' + `<@${interaction.member.id}>` + 'たんがモンハンライズ参加者募集中でし！\n';
    let color = '#b71008';
    const image = 'https://raw.githubusercontent.com/shngmsw/ikabu/stg/images/games/MonsterHunterRiseSunBreak.jpg';
    const logo = 'https://raw.githubusercontent.com/shngmsw/ikabu/stg/images/games/MonsterHunterRiseSunBreak_logo.png';
    sendOtherGames(interaction, title, txt, color, image, logo);
}

function apexLegends(interaction) {
    const role_id = interaction.member.guild.roles.cache.find((role) => role.name === 'レジェンド');
    let title = 'Apex Legends';
    let txt = role_id.toString() + ' 【Apex Legends募集】\n' + `<@${interaction.member.id}>` + 'たんがApexLegendsの参加者募集中でし！\n';
    let color = '#F30100';
    const image = 'https://raw.githubusercontent.com/shngmsw/ikabu/stg/images/games/ApexLegends.jpg';
    const logo = 'https://raw.githubusercontent.com/shngmsw/ikabu/stg/images/games/ApexLegends_logo.png';
    sendOtherGames(interaction, title, txt, color, image, logo);
}

function deadByDayLight(interaction) {
    const role_id = interaction.member.guild.roles.cache.find((role) => role.name === 'DbD');
    let title = 'Dead by Daylight';
    const txt = role_id.toString() + ' 【Dead by Daylight募集】\n' + `<@${interaction.member.id}>` + 'たんがDbD参加者募集中でし！\n';
    let color = '#84331F';
    const image = 'https://raw.githubusercontent.com/shngmsw/ikabu/stg/images/games/DeadByDaylight.jpg';
    const logo = 'https://raw.githubusercontent.com/shngmsw/ikabu/stg/images/games/deadbydaylight_logo.png';
    sendOtherGames(interaction, title, txt, color, image, logo);
}

function valorant(interaction) {
    const role_id = interaction.member.guild.roles.cache.find((role) => role.name === 'エージェント');
    let title = 'VALORANT';
    const txt = role_id.toString() + ' 【VALORANT募集】\n' + `<@${interaction.member.id}>` + 'たんがVALORANT参加者募集中でし！\n';
    let color = '#FF4654';
    const image = 'https://raw.githubusercontent.com/shngmsw/ikabu/stg/images/games/valorant.jpg';
    const logo = 'https://raw.githubusercontent.com/shngmsw/ikabu/stg/images/games/valorant_logo.png';
    sendOtherGames(interaction, title, txt, color, image, logo);
}

function others(interaction) {
    const role_id = interaction.member.guild.roles.cache.find((role) => role.name === '別ゲー');
    let title = interaction.options.getString('ゲームタイトル');
    const txt = role_id.toString() + ` 【${title}募集】\n` + `<@${interaction.member.id}>` + `たんが${title}参加者募集中でし！\n`;
    let color = '#379C30';
    const image = 'https://raw.githubusercontent.com/shngmsw/ikabu/stg/images/games/others.jpg';
    const logo = 'https://raw.githubusercontent.com/shngmsw/ikabu/stg/images/games/others_logo.png';
    sendOtherGames(interaction, title, txt, color, image, logo);
}

async function sendOtherGames(interaction, title, txt, color, image, logo) {
    let options = interaction.options;
    let recruitNum = options.getInteger('あと何人募集');
    let condition = options.getString('内容または参加条件');

    const embed = new MessageEmbed()
        .setAuthor({
            name: title,
            iconURL: logo,
        })
        .setColor(color)
        .addFields([
            {
                name: '募集人数',
                value: recruitNum.toString(),
            },
            {
                name: '参加条件',
                value: condition == null ? 'なし' : condition,
            },
        ])
        .setImage(image)
        .setThumbnail(logo);

    try {
        await interaction.reply({ content: '募集完了でし！参加者が来るまで気長に待つでし！', ephemeral: true });
        const sentMessage = await interaction.channel.send({
            content: txt,
            embeds: [embed],
        });
        // 募集文を削除してもボタンが動くように、bot投稿メッセージのメッセージIDでボタン作る
        sentMessage.edit({ components: [recruitActionRow(sentMessage)] });
        setTimeout(function () {
            const host_mention = `<@${interaction.member.id}>`;
            sentMessage.edit({
                content: `${host_mention}たんの募集は〆！`,
                components: [disableButtons()],
            });
        }, 7200000);
    } catch (error) {
        console.log(error);
    }
}

function recruitActionRow(msg) {
    const joinParams = new URLSearchParams();
    joinParams.append('d', 'jr');
    joinParams.append('mid', msg.id);
    joinParams.append('cid', msg.channel.id);

    const cancelParams = new URLSearchParams();
    cancelParams.append('d', 'cr');
    cancelParams.append('mid', msg.id);
    cancelParams.append('cid', msg.channel.id);

    const closeParams = new URLSearchParams();
    closeParams.append('d', 'close');
    closeParams.append('mid', msg.id);
    closeParams.append('cid', msg.channel.id);

    return new MessageActionRow().addComponents([
        new MessageButton().setCustomId(joinParams.toString()).setLabel('参加').setStyle('PRIMARY'),
        new MessageButton().setCustomId(cancelParams.toString()).setLabel('キャンセル').setStyle('DANGER'),
        new MessageButton().setCustomId(closeParams.toString()).setLabel('〆').setStyle('SECONDARY'),
    ]);
}
function disableButtons() {
    let buttons = new MessageActionRow().addComponents([
        new MessageButton().setCustomId('join').setLabel('参加').setStyle('PRIMARY').setDisabled(),
        new MessageButton().setCustomId('cancel').setLabel('キャンセル').setStyle('DANGER').setDisabled(),
        new MessageButton().setCustomId('close').setLabel('〆').setStyle('SECONDARY').setDisabled(),
    ]);
    return buttons;
}
