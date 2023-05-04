import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    CacheType,
    ChatInputCommandInteraction,
    EmbedBuilder,
    Message,
    User,
} from 'discord.js';
import { FriendCodeService } from '../../../db/friend_code_service.js';
import { log4js_obj } from '../../../log4js_settings.js';
import { searchDBMemberById } from '../../common/manager/member_manager.js';
import { assertExistCheck, exists } from '../../common/others.js';
import { Member } from '../../../db/model/member.js';
import { searchChannelById } from '../../common/manager/channel_manager.js';
const logger = log4js_obj.getLogger();

export async function handleFriendCode(interaction: ChatInputCommandInteraction<CacheType>) {
    if (!interaction.isCommand()) return;
    // 'インタラクションに失敗'が出ないようにするため

    const options = interaction.options;
    const subCommand = options.getSubcommand();
    if (subCommand === 'add') {
        insertFriendCode(interaction);
    } else if (subCommand === 'show') {
        selectFriendCode(interaction);
    }
}

export async function selectFriendCode(interaction: ChatInputCommandInteraction<CacheType>) {
    await interaction.deferReply({ ephemeral: false });

    let targetUser: Member | User;
    let userId: string;
    if (interaction.inGuild()) {
        assertExistCheck(interaction.guild, 'guild');
        const guild = interaction.guild;
        targetUser = await searchDBMemberById(guild, interaction.member.user.id);
        userId = interaction.member.user.id;
    } else {
        targetUser = interaction.user;
        userId = interaction.user.id;
    }

    const deleteButton = new ActionRowBuilder<ButtonBuilder>();
    deleteButton.addComponents([new ButtonBuilder().setCustomId('fchide').setLabel('削除').setStyle(ButtonStyle.Danger)]);
    const fc = await FriendCodeService.getFriendCodeByUserId(userId);
    if (exists(fc[0])) {
        await interaction.editReply({
            embeds: [composeEmbed(targetUser, fc[0].code, true)],
            components: [deleteButton],
        });
        return;
    }

    if (interaction.inGuild()) {
        assertExistCheck(interaction.guild, 'guild');
        const guild = await interaction.guild.fetch();
        const channel = await searchChannelById(guild, process.env.CHANNEL_ID_INTRODUCTION);
        if (exists(channel)) {
            const messages = await channel.messages.fetch({ limit: 100 }).catch((error: $TSFixMe) => {
                logger.error(error);
            });
            const list = await messages.filter((message: Message) => userId === message.author.id && !message.author.bot);
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
    const code = options.getString('フレンドコード');

    await FriendCodeService.save(userId, code);
    await interaction.editReply({
        content: `\`${code}\`で覚えたでし！変更したい場合はもう一度登録すると上書きされるでし！`,
    });
}

export async function deleteFriendCode(interaction: $TSFixMe) {
    await interaction.message.delete();
}
