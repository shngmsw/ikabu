import {
    CacheType,
    ChatInputCommandInteraction,
    EmbedBuilder,
    MessageContextMenuCommandInteraction,
} from 'discord.js';

import { log4js_obj } from '../../../log4js_settings';
import { getGuildByInteraction } from '../../common/manager/guild_manager';
import { searchDBMemberById } from '../../common/manager/member_manager';
import { assertExistCheck, exists } from '../../common/others';
import { sendEmbedsWebhook } from '../../common/webhook';

const logger = log4js_obj.getLogger('interaction');

export async function sendCommandLog(
    interaction:
        | MessageContextMenuCommandInteraction<CacheType>
        | ChatInputCommandInteraction<CacheType>,
) {
    try {
        let authorName = '不明なユーザー';
        let authorId = '????????????????????';
        let iconUrl = 'https://cdn.discordapp.com/embed/avatars/0.png';
        let channelName = '不明なチャンネル';
        if (interaction.inGuild()) {
            const guild = await getGuildByInteraction(interaction);
            const member = await searchDBMemberById(guild, interaction.member.user.id);
            if (exists(member)) {
                authorName = member.displayName;
                authorId = member.userId;
                iconUrl = member.iconUrl;
                if (exists(interaction.channel)) {
                    channelName = interaction.channel.name;
                }
            }
        } else {
            const user = interaction.user;
            authorName = user.displayName;
            authorId = user.id;
            iconUrl = user.avatarURL() ?? 'https://cdn.discordapp.com/embed/avatars/0.png';
            channelName = 'DM';
        }

        let commandName = interaction.commandName;
        let title = 'コマンドログ';
        if (interaction.isChatInputCommand()) {
            title = 'スラッシュコマンドログ';
            if (interaction.inGuild()) {
                commandName = interaction.toString(); // 鯖内の場合はコマンド名と引数を表示
            } else {
                commandName = interaction.commandName; // DMの場合はコマンド名のみ
            }
        } else if (interaction.isMessageContextMenuCommand()) {
            title = 'コンテキストメニューログ';
            commandName = interaction.commandName;
        }

        const embed = new EmbedBuilder();
        embed.setTitle(title);
        embed.setAuthor({
            name: `${authorName} [${authorId}]`,
            iconURL: iconUrl,
        });
        embed.addFields([
            {
                name: '使用コマンド',
                value: commandName,
                inline: true,
            },
            {
                name: '使用チャンネル',
                value: channelName,
                inline: false,
            },
        ]);
        embed.setColor('#CFCFCF');
        embed.setTimestamp(interaction.createdAt);
        assertExistCheck(process.env.COMMAND_LOG_WEBHOOK_URL, 'COMMAND_LOG_WEBHOOK_URL');
        await sendEmbedsWebhook(process.env.COMMAND_LOG_WEBHOOK_URL, [embed]);
    } catch (error) {
        logger.error(error);
    }
}
