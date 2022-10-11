const { EmbedBuilder, PermissionsBitField } = require('discord.js');
const { searchMessageById } = require('../../../manager/messageManager');
const { searchMemberById } = require('../../../manager/memberManager');
const { isNotEmpty } = require('../../../common');
const { recruitActionRow, recruitDeleteButton, unlockChannelButton } = require('../../../common/button_components.js');

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
    } else if (options.getSubcommand() === 'overwatch') {
        overwatch(interaction, roles);
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

function overwatch(interaction, roles) {
    const role_id = roles.find((role) => role.name === 'ヒーロー');
    let title = 'Overwatch2';
    let recruitNumText = interaction.options.getString('募集人数');
    let mention = role_id.toString();
    const txt = `<@${interaction.member.id}>` + 'たんがOverwatch2の参加者募集中でし！\n';
    let color = '#ED6516';
    const image = 'https://raw.githubusercontent.com/shngmsw/ikabu/stg/images/games/Overwatch2.png';
    const logo = 'https://raw.githubusercontent.com/shngmsw/ikabu/stg/images/games/Overwatch_logo.png';
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

    let embed = new EmbedBuilder()
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

        let isLock = false;
        // 募集文を削除してもボタンが動くように、bot投稿メッセージのメッセージIDでボタン作る
        if (reserve_channel != null && interaction.member.voice.channelId != reserve_channel.id) {
            // vc指定なし
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
                    { id: interaction.member.user.id, allow: [PermissionsBitField.Flags.Connect] },
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
    } catch (error) {
        console.log(error);
    }
}
