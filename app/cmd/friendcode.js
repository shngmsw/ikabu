const insert = require('../../db/fc_insert.js');
const getFC = require('../../db/fc_select.js');
const Discord = require('discord.js');
module.exports = {
    handleFriendCode: handleFriendCode,
};

async function handleFriendCode(interaction) {
    if (!interaction.isCommand()) return;
    // 'インタラクションに失敗'が出ないようにするため
    await interaction.deferReply({ ephemeral: false });

    const options = interaction.options;
    const subCommand = options.getSubcommand();
    if (subCommand === 'add') {
        insertFriendCode(interaction);
    } else if (subCommand === 'show') {
        selectFriendCode(interaction);
    }
}

async function selectFriendCode(interaction) {
    let targetUser = interaction.options.getUser('user');
    let id = targetUser.id;
    let ch = await interaction.guild.channels.cache.find((channel) => channel.name === '自己紹介');
    let messages = await ch.messages.fetch({ limit: 100 }).catch(console.error);
    let list = await messages.filter((m) => targetUser.id === m.author.id && !m.author.bot);
    let result = list.map(function (value) {
        return value.content;
    });

    if (result.length == 0) {
        let fc = await getFC(id);
        interaction.followUp({
            content: '登録済みのフレンドコードがあったでし！',
            ephemeral: true,
        });
        if (fc[0] != null) {
            interaction.editReply({
                embeds: [composeEmbed(targetUser, fc[0].code, true)],
                ephemeral: false,
            });
            return;
        }
    }
    if (result.length > 0) {
        interaction.followUp({
            content: '自己紹介チャンネルから引用してきたでし！',
        });
        let embeds = [];
        for (var r of result) {
            embeds.push(composeEmbed(targetUser, r, false));
        }
        interaction.followUp({
            embeds: embeds,
        });
    } else {
        interaction.editReply({
            content:
                '自己紹介チャンネルに投稿がないか、投稿した日時が古すぎて検索できないでし\n `/friend_code add`でコードを登録してみるでし！',
            ephemeral: true,
        });
    }
}

function composeEmbed(users, fc, isDatabase) {
    const embed = new Discord.MessageEmbed();
    embed.setDescription(fc);
    embed.setAuthor({ name: users.username, iconURL: users.displayAvatarURL() });
    if (!isDatabase) {
        embed.setFooter({
            text: '自己紹介チャンネルより引用',
        });
    }
    return embed;
}

async function insertFriendCode(interaction) {
    let id = interaction.member.user.id;
    const options = interaction.options;
    const code = options.getString('フレンドコード');

    insert(id, code);
    interaction.editReply({
        content: `${code}で覚えたでし！変更したい場合はもう一度登録すると上書きされるでし！`,
        ephemeral: true,
    });
}
