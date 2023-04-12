import { BaseGuildTextChannel, ChatInputCommandInteraction, EmbedBuilder, MessageContextMenuCommandInteraction } from 'discord.js';
import { searchDBMemberById } from '../../common/manager/member_manager';
import { sendEmbedsWebhook } from '../../common/webhook';

export async function sendCommandLog(interaction: MessageContextMenuCommandInteraction | ChatInputCommandInteraction) {
    const guild = interaction.guild;
    if (guild === null || interaction.member === null || !(interaction.channel instanceof BaseGuildTextChannel)) {
        return;
    }
    const authorId = interaction.member.user.id;
    const author = await searchDBMemberById(guild, authorId);
    const commandName = interaction.commandName;

    const embed = new EmbedBuilder();
    embed.setTitle('メニューコマンドログ');
    embed.setAuthor({
        name: `${author.displayName} [${authorId}]`,
        iconURL: author.iconUrl,
    });
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
