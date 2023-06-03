import { BaseGuildTextChannel, ChatInputCommandInteraction, EmbedBuilder, MessageContextMenuCommandInteraction } from 'discord.js';
import { searchDBMemberById } from '../../common/manager/member_manager';
import { sendEmbedsWebhook } from '../../common/webhook';
import { exists, notExists } from '../../common/others';
import { log4js_obj } from '../../../log4js_settings';

const logger = log4js_obj.getLogger('interaction');

export async function sendCommandLog(interaction: MessageContextMenuCommandInteraction | ChatInputCommandInteraction) {
    if (!interaction.inGuild()) return;

    const guild = interaction.guild;
    if (notExists(guild) || notExists(interaction.member) || !(interaction.channel instanceof BaseGuildTextChannel)) {
        return;
    }
    const authorId = interaction.member.user.id;
    const author = await searchDBMemberById(guild, authorId);

    let commandName = interaction.commandName;
    let title = 'コマンドログ';
    if (interaction instanceof ChatInputCommandInteraction) {
        title = 'スラッシュコマンドログ';
        commandName = interaction.toString();
    } else if (interaction instanceof MessageContextMenuCommandInteraction) {
        title = 'コンテキストメニューログ';
        commandName = interaction.commandName;
    }

    const embed = new EmbedBuilder();
    embed.setTitle(title);
    if (exists(author)) {
        embed.setAuthor({
            name: `${author.displayName} [${authorId}]`,
            iconURL: author.iconUrl,
        });
    } else {
        logger.warn('No log generated due to missing author information');
    }
    embed.addFields([
        {
            name: '使用コマンド',
            value: commandName,
            inline: true,
        },
        {
            name: '使用チャンネル',
            value: interaction.channel.name,
            inline: false,
        },
    ]);
    embed.setColor('#CFCFCF');
    embed.setTimestamp(interaction.createdAt);
    await sendEmbedsWebhook(process.env.COMMAND_LOG_WEBHOOK_URL, [embed]);
}
