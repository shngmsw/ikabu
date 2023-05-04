import { EmbedBuilder, ChannelType } from 'discord.js';
import { isNotEmpty, isEmpty } from '../../common/others';
import { searchChannelById } from '../../common/manager/channel_manager';
import { searchAPIMemberById, getMemberColor } from '../../common/manager/member_manager';
import { log4js_obj } from '../../../log4js_settings';

const logger = log4js_obj.getLogger('interaction');

export async function voiceMention(interaction: $TSFixMe) {
    if (!interaction.inGuild()) return;

    try {
        await interaction.deferReply({ ephemeral: false });

        const guild = interaction.guild;
        let text = interaction.options.getString('メッセージ');
        let channel = interaction.options.getChannel('チャンネル');
        if (isEmpty(channel)) {
            channel = interaction.channel;
            if (channel.type == ChannelType.GuildText) {
                await interaction.editReply({
                    content:
                        'このチャンネルはテキストチャンネルでし！\nここにメンションしたい場合は、オプションでメンションしたいメンバーがいるチャンネルを指定するでし！',
                });
                return;
            }
        }
        const author = await searchAPIMemberById(guild, interaction.member.user.id);
        channel = await searchChannelById(guild, channel.id);
        const members = channel.members;

        if (members.size < 1) {
            await interaction.editReply({ content: 'そのVCには誰もいないでし！' });
            return;
        }

        let mentions = '';
        for (const member of members) {
            mentions += `<@${member[1].id}>`;
        }
        mentions += '\n';

        if (isEmpty(text)) {
            text = 'メッセージはありません。';
        }

        await interaction.deleteReply();

        const embed = await createEmbed(author, text, interaction.createdAt);
        interaction.channel.send({ content: mentions, embeds: [embed] });
    } catch (error) {
        logger.error(error);
        interaction.channel.send('なんかエラー出てるわ');
    }
}

async function createEmbed(author: $TSFixMe, text: $TSFixMe, createdAt: $TSFixMe) {
    const embed = new EmbedBuilder();
    const color = getMemberColor(author);
    if (isNotEmpty(text)) {
        embed.setDescription(text);
    }
    embed.setTimestamp(createdAt);
    embed.setColor(color);
    embed.setAuthor({
        name: author.displayName,
        iconURL: author.displayAvatarURL(),
    });
    return embed;
}
