const { MessageEmbed, Permissions } = require('discord.js');
const app = require('app-root-path').resolve('app');
const { searchMessageById } = require(app + '/manager/messageManager.js');
const { searchMemberById } = require(app + '/manager/memberManager.js');
const {
    recruitDeleteButton,
    recruitActionRow,
    recruitDeleteButtonWithChannel,
    recruitActionRowWithChannel,
    unlockChannelButton,
} = require(app + '/common/button_components.js');

module.exports = {
    otherGameRecruit: otherGameRecruit,
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function otherGameRecruit(interaction) {
    // subCommands取得
    if (!interaction.isCommand()) return;

    const options = interaction.options;
    const voice_channel = interaction.options.getChannel('使用チャンネル');
    var usable_channel = ['alfa', 'bravo', 'charlie', 'delta', 'echo', 'fox', 'golf', 'hotel', 'india', 'juliett', 'kilo', 'lima', 'mike'];

    if (voice_channel != null) {
        if (voice_channel.members.size != 0 && !voice_channel.members.has(interaction.member.user.id)) {
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

    // 募集がfollowUpでないとリグマと同じfunctionでeditできないため
    await interaction.deferReply();
    const guild = await interaction.guild.fetch();
    const roles = await guild.roles.fetch();

    if (options.getSubcommand() === 'apex') {
        apexLegends(interaction, roles);
    } else if (options.getSubcommand() === 'mhr') {
        monsterHunterRise(interaction, roles);
    } else if (options.getSubcommand() === 'dbd') {
        deadByDayLight(interaction, roles);
    } else if (options.getSubcommand() === 'valo') {
        valorant(interaction, roles);
    } else if (options.getSubcommand() === 'other') {
        others(interaction, roles);
    }
}

function monsterHunterRise(interaction, roles) {
    const role_id = roles.find((role) => role.name === 'ハンター');
    let title = 'MONSTER HUNTER RISE';
    let recruitNumText = interaction.options.getString('募集人数');
    let mention = role_id.toString();
    let txt = `<@${interaction.member.id}>` + 'たんがモンハンライズ参加者募集中でし！\n';
    let color = '#b71008';
    const image = 'https://raw.githubusercontent.com/shngmsw/ikabu/stg/images/games/MonsterHunterRiseSunBreak.jpg';
    const logo = 'https://raw.githubusercontent.com/shngmsw/ikabu/stg/images/games/MonsterHunterRiseSunBreak_logo.png';
    sendOtherGames(interaction, title, recruitNumText, mention, txt, color, image, logo);
}

function apexLegends(interaction, roles) {
    const role_id = roles.find((role) => role.name === 'レジェンド');
    let title = 'Apex Legends';
    let recruitNumText = interaction.options.getString('募集人数');
    let mention = role_id.toString();
    let txt = `<@${interaction.member.id}>` + 'たんがApexLegendsの参加者募集中でし！\n';
    let color = '#F30100';
    const image = 'https://raw.githubusercontent.com/shngmsw/ikabu/stg/images/games/ApexLegends.jpg';
    const logo = 'https://raw.githubusercontent.com/shngmsw/ikabu/stg/images/games/ApexLegends_logo.png';
    sendOtherGames(interaction, title, recruitNumText, mention, txt, color, image, logo);
}

function deadByDayLight(interaction, roles) {
    const role_id = roles.find((role) => role.name === 'DbD');
    let title = 'Dead by Daylight';
    let recruitNumText = interaction.options.getString('募集人数');
    let mention = role_id.toString();
    const txt = `<@${interaction.member.id}>` + 'たんがDbD参加者募集中でし！\n';
    let color = '#84331F';
    const image = 'https://raw.githubusercontent.com/shngmsw/ikabu/stg/images/games/DeadByDaylight.jpg';
    const logo = 'https://raw.githubusercontent.com/shngmsw/ikabu/stg/images/games/deadbydaylight_logo.png';
    sendOtherGames(interaction, title, recruitNumText, mention, txt, color, image, logo);
}

function valorant(interaction, roles) {
    const role_id = roles.find((role) => role.name === 'エージェント');
    let title = 'VALORANT';
    let recruitNumText = interaction.options.getString('募集人数');
    let mention = role_id.toString();
    const txt = `<@${interaction.member.id}>` + 'たんがVALORANT参加者募集中でし！\n';
    let color = '#FF4654';
    const image = 'https://raw.githubusercontent.com/shngmsw/ikabu/stg/images/games/valorant.jpg';
    const logo = 'https://raw.githubusercontent.com/shngmsw/ikabu/stg/images/games/valorant_logo.png';
    sendOtherGames(interaction, title, recruitNumText, mention, txt, color, image, logo);
}

function others(interaction, roles) {
    const role_id = roles.find((role) => role.name === '別ゲー');
    let title = interaction.options.getString('ゲームタイトル');
    let recruitNumText = interaction.options.getString('募集人数');
    let mention = role_id.toString();
    const txt = `<@${interaction.member.id}>` + `たんが${title}参加者募集中でし！\n`;
    let color = '#379C30';
    const image = 'https://raw.githubusercontent.com/shngmsw/ikabu/stg/images/games/others.jpg';
    const logo = 'https://raw.githubusercontent.com/shngmsw/ikabu/stg/images/games/others_logo.png';
    sendOtherGames(interaction, title, recruitNumText, mention, txt, color, image, logo);
}

async function sendOtherGames(interaction, title, recruitNumText, mention, txt, color, image, logo) {
    let options = interaction.options;

    let condition = options.getString('内容または参加条件');

    const guild = await interaction.guild.fetch();

    let author = await searchMemberById(guild, interaction.member.user.id);
    const reserve_channel = interaction.options.getChannel('使用チャンネル');

    let embed = new MessageEmbed()
        .setAuthor({
            name: author.displayName,
            iconURL: author.displayAvatarURL(),
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

    if (reserve_channel != null) {
        embed.addFields({ name: '使用チャンネル', value: '🔉 ' + reserve_channel.name });
    }

    try {
        const header = await interaction.editReply({ content: txt, embeds: [embed], ephemeral: false });
        const sentMessage = await interaction.channel.send({
            content: mention + ' ボタンを押して参加表明するでし',
        });
        await interaction.followUp({
            content: '募集完了でし！参加者が来るまで気長に待つでし！\n15秒間は募集を取り消せるでし！',
            components: reserve_channel != null ? [unlockChannelButton(reserve_channel.id)] : [],
            ephemeral: true,
        });
        // 募集文を削除してもボタンが動くように、bot投稿メッセージのメッセージIDでボタン作る
        if (reserve_channel == null) {
            sentMessage.edit({ components: [recruitDeleteButton(sentMessage, header)] });
        } else {
            sentMessage.edit({ components: [recruitDeleteButtonWithChannel(sentMessage, reserve_channel.id, header)] });
            reserve_channel.permissionOverwrites.set(
                [
                    { id: guild.roles.everyone.id, deny: [Permissions.FLAGS.CONNECT] },
                    { id: interaction.member.user.id, allow: [Permissions.FLAGS.CONNECT] },
                ],
                'Reserve Voice Channel',
            );
        }

        // 15秒後に削除ボタンを消す
        await sleep(15000);
        let cmd_message = await searchMessageById(guild, interaction.channel.id, sentMessage.id);
        if (cmd_message) {
            if (reserve_channel == null) {
                sentMessage.edit({ components: [recruitActionRow(header)] });
            } else {
                sentMessage.edit({ components: [recruitActionRowWithChannel(reserve_channel.id, header)] });
            }
        }
    } catch (error) {
        console.log(error);
    }
}
