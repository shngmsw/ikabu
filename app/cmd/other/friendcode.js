const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const FriendCodeService = require('../../../db/friend_code_service.js');
const { searchMemberById } = require('../../manager/memberManager.js');
const log4js = require('log4js');

log4js.configure(process.env.LOG4JS_CONFIG_PATH);
const logger = log4js.getLogger();

module.exports = {
    handleFriendCode: _handleFriendCode,
    deleteFriendCode: _deleteFriendCode,
};

async function _handleFriendCode(interaction) {
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
    const guild = interaction.guild;
    const targetUser = await searchMemberById(guild, interaction.member.user.id);

    const deleteButton = new ActionRowBuilder();
    deleteButton.addComponents([new ButtonBuilder().setCustomId('fchide').setLabel('削除').setStyle(ButtonStyle.Danger)]);
    let fc = await FriendCodeService.getFriendCodeByUserId(targetUser.id);
    if (fc[0] != null) {
        await interaction.editReply({
            embeds: [composeEmbed(targetUser, fc[0].code, true)],
            components: [deleteButton],
            ephemeral: false,
        });
        return;
    }

    const channelCollection = await guild.channels.fetch();
    let ch = channelCollection.find((channel) => channel.name === '自己紹介');
    let messages = await ch.messages.fetch({ limit: 100 }).catch((error) => {
        logger.error(error);
    });
    let list = await messages.filter((m) => targetUser.id === m.author.id && !m.author.bot);
    let result = list.map(function (value) {
        return value.content;
    });

    if (result.length > 0) {
        let embeds = [];
        for (var r of result) {
            embeds.push(composeEmbed(targetUser, r, false));
        }
        await interaction.editReply({
            embeds: embeds,
            components: [deleteButton],
        });
    } else {
        await interaction.editReply({
            content:
                '自己紹介チャンネルに投稿がないか、投稿した日時が古すぎて検索できないでし\n `/friend_code add`でコードを登録してみるでし！',
            ephemeral: true,
        });
    }
}

function composeEmbed(users, fc, isDatabase) {
    const embed = new EmbedBuilder();
    embed.setDescription(fc);
    embed.setAuthor({ name: users.displayName, iconURL: users.displayAvatarURL() });
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

    await FriendCodeService.save(id, code);
    await interaction.editReply({
        content: `\`${code}\`で覚えたでし！変更したい場合はもう一度登録すると上書きされるでし！`,
        ephemeral: true,
    });
}

async function _deleteFriendCode(interaction) {
    await interaction.message.delete();
}
