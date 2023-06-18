import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonInteraction,
    ButtonStyle,
    CacheType,
    ChatInputCommandInteraction,
    EmbedBuilder,
    Message,
    User,
} from 'discord.js';

import { FriendCodeService } from '../../../db/friend_code_service.js';
import { Member } from '../../../db/model/member.js';
import { log4js_obj } from '../../../log4js_settings.js';
import { searchChannelById } from '../../common/manager/channel_manager.js';
import { getGuildByInteraction } from '../../common/manager/guild_manager.js';
import { searchDBMemberById } from '../../common/manager/member_manager.js';
import { assertExistCheck, exists } from '../../common/others.js';
const logger = log4js_obj.getLogger();

export async function handleFriendCode(interaction: ChatInputCommandInteraction<CacheType>) {
    if (!interaction.isCommand()) return;
    // 'インタラクションに失敗'が出ないようにするため

    const options = interaction.options;
    const subCommand = options.getSubcommand();
    if (subCommand === 'add') {
        void insertFriendCode(interaction);
    } else if (subCommand === 'show') {
        void selectFriendCode(interaction);
    }
}

export async function selectFriendCode(interaction: ChatInputCommandInteraction<CacheType>) {
    await interaction.deferReply({ ephemeral: false });

    let targetUser: Member | User | null;
    let userId: string;
    if (interaction.inGuild()) {
        const guild = await getGuildByInteraction(interaction);
        targetUser = await searchDBMemberById(guild, interaction.member.user.id);
        userId = interaction.member.user.id;
    } else {
        targetUser = interaction.user;
        userId = interaction.user.id;
    }

    const fcObj = await FriendCodeService.getFriendCodeObjByUserId(userId);

    assertExistCheck(targetUser, 'member');

    if (exists(fcObj[0])) {
        const fcUrl = fcObj[0].url;
        const buttons = new ActionRowBuilder<ButtonBuilder>();
        if (exists(fcUrl)) {
            buttons.addComponents([new ButtonBuilder().setURL(fcUrl).setLabel('NSOアプリで開く').setStyle(ButtonStyle.Link)]);
        }
        buttons.addComponents([new ButtonBuilder().setCustomId('fchide').setLabel('削除').setStyle(ButtonStyle.Danger)]);
        await interaction.editReply({
            embeds: [composeEmbed(targetUser, fcObj[0].code, true)],
            components: [buttons],
        });
        return;
    }

    if (interaction.inGuild()) {
        assertExistCheck(process.env.CHANNEL_ID_INTRODUCTION, 'CHANNEL_ID_INTRODUCTION');
        const guild = await getGuildByInteraction(interaction);
        const channel = await searchChannelById(guild, process.env.CHANNEL_ID_INTRODUCTION);
        if (exists(channel) && channel.isTextBased()) {
            let result = null;
            try {
                const messages = await channel.messages.fetch({ limit: 100 });
                const list = messages.filter((message: Message<true>) => userId === message.author.id && !message.author.bot);
                result = list.map(function (value: Message<true>) {
                    return value.content;
                });
            } catch (error) {
                logger.error(error);
            }

            const button = new ActionRowBuilder<ButtonBuilder>();
            button.addComponents([new ButtonBuilder().setCustomId('fchide').setLabel('削除').setStyle(ButtonStyle.Danger)]);

            if (exists(result) && result.length > 0) {
                const embeds = [];
                for (const r of result) {
                    embeds.push(composeEmbed(targetUser, r, false));
                }
                await interaction.editReply({
                    embeds,
                    components: [button],
                });
            } else {
                await interaction.followUp({
                    content:
                        '自己紹介チャンネルに投稿がないか、投稿した日時が古すぎて検索できないでし\n `/friend_code add`でコードを登録してみるでし！',
                });
                await interaction.deleteReply();
            }
            return;
        }
    }

    // DMかつDBにないとき or GuildかつDBにないかつ自己紹介チャンネルが見つからないとき(練習鯖とか)
    await interaction.editReply('フレンドコードが登録されていないでし！\n`/friend_code add`でコードを登録してみるでし！');
}

function composeEmbed(user: User | Member, fc: string, isDatabase: boolean) {
    const embed = new EmbedBuilder();
    embed.setDescription(fc);

    if (user instanceof Member) {
        embed.setAuthor({
            name: user.displayName,
            iconURL: user.iconUrl,
        });
    } else if (user instanceof User) {
        embed.setAuthor({
            name: user.username,
            iconURL: user.displayAvatarURL(),
        });
    }

    if (!isDatabase) {
        embed.setFooter({
            text: '自己紹介チャンネルより引用',
        });
    }
    return embed;
}

async function insertFriendCode(interaction: ChatInputCommandInteraction<CacheType>) {
    await interaction.deferReply({ ephemeral: true });

    let userId;
    if (interaction.inGuild()) {
        userId = interaction.member.user.id;
    } else {
        userId = interaction.user.id;
    }
    const options = interaction.options;
    const code = options.getString('フレンドコード', true);
    const fcUrl = options.getString('フレンドコードurl');

    if (exists(fcUrl) && !isFcUrl(fcUrl)) {
        return await interaction.editReply(`\`${fcUrl}\`はフレンドコードのURLではないでし！`);
    }

    await FriendCodeService.save(userId, code, fcUrl);
    await interaction.editReply({
        content: `\`${code}\`で覚えたでし！変更したい場合はもう一度登録すると上書きされるでし！`,
    });
}

export async function deleteFriendCode(interaction: ButtonInteraction<CacheType>) {
    await interaction.message.delete();
}

function isFcUrl(url: string) {
    return url.match(/https:\/\/lounge.nintendo.com\/friendcode\//g) !== null;
}
