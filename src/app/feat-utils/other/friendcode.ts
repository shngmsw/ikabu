import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from 'discord.js';
import { FriendCodeService } from '../../../db/friend_code_service.js';
import { log4js_obj } from '../../../log4js_settings.js';
import { searchAPIMemberById } from '../../common/manager/member_manager.js';
const logger = log4js_obj.getLogger();

export async function handleFriendCode(interaction: $TSFixMe) {
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

export async function selectFriendCode(interaction: $TSFixMe) {
    const guild = interaction.guild;
    const targetUser = await searchAPIMemberById(guild, interaction.member.user.id);

    const deleteButton = new ActionRowBuilder();
    deleteButton.addComponents([new ButtonBuilder().setCustomId('fchide').setLabel('削除').setStyle(ButtonStyle.Danger)]);
    const fc = await FriendCodeService.getFriendCodeByUserId(targetUser.id);
    if (fc[0] != null) {
        await interaction.editReply({
            embeds: [composeEmbed(targetUser, fc[0].code, true)],
            components: [deleteButton],
            ephemeral: false,
        });
        return;
    }

    const channelCollection = await guild.channels.fetch();
    const ch = channelCollection.find((channel: $TSFixMe) => channel.name === '自己紹介');
    const messages = await ch.messages.fetch({ limit: 100 }).catch((error: $TSFixMe) => {
        logger.error(error);
    });
    const list = await messages.filter((m: $TSFixMe) => targetUser.id === m.author.id && !m.author.bot);
    const result = list.map(function (value: $TSFixMe) {
        return value.content;
    });

    if (result.length > 0) {
        const embeds = [];
        for (const r of result) {
            embeds.push(composeEmbed(targetUser, r, false));
        }
        await interaction.editReply({
            embeds,
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

function composeEmbed(users: $TSFixMe, fc: $TSFixMe, isDatabase: $TSFixMe) {
    const embed = new EmbedBuilder();
    embed.setDescription(fc);
    embed.setAuthor({
        name: users.displayName,
        iconURL: users.displayAvatarURL(),
    });
    if (!isDatabase) {
        embed.setFooter({
            text: '自己紹介チャンネルより引用',
        });
    }
    return embed;
}

async function insertFriendCode(interaction: $TSFixMe) {
    const id = interaction.member.user.id;
    const options = interaction.options;
    const code = options.getString('フレンドコード');

    await FriendCodeService.save(id, code);
    await interaction.editReply({
        content: `\`${code}\`で覚えたでし！変更したい場合はもう一度登録すると上書きされるでし！`,
        ephemeral: true,
    });
}

export async function deleteFriendCode(interaction: $TSFixMe) {
    await interaction.message.delete();
}
