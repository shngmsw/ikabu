import { EmbedBuilder, ChatInputCommandInteraction, GuildMember } from 'discord.js';

import { log4js_obj } from '../../../log4js_settings';
import { searchChannelById } from '../../common/manager/channel_manager';
import { getGuildByInteraction } from '../../common/manager/guild_manager';
import { searchAPIMemberById, getMemberColor } from '../../common/manager/member_manager';
import { isNotEmpty, isEmpty, notExists, assertExistCheck, exists } from '../../common/others';

const logger = log4js_obj.getLogger('interaction');

export async function voiceMention(interaction: ChatInputCommandInteraction<'cached' | 'raw'>) {
    try {
        await interaction.deferReply({ ephemeral: false });

        const guild = await getGuildByInteraction(interaction);

        let text = interaction.options.getString('メッセージ', true);
        let voiceChannel = interaction.options.getChannel('チャンネル');
        let sendChannel;

        if (notExists(voiceChannel)) {
            voiceChannel = await searchChannelById(guild, interaction.channelId);
            sendChannel = voiceChannel;
        } else {
            voiceChannel = await searchChannelById(guild, voiceChannel.id);
            sendChannel = await searchChannelById(guild, interaction.channelId);
        }
        assertExistCheck(voiceChannel, 'channel');
        assertExistCheck(sendChannel, 'channel');

        if (!voiceChannel.isVoiceBased()) {
            await interaction.editReply({
                content:
                    'このチャンネルはテキストチャンネルでし！\nここにメンションしたい場合は、オプションでメンションしたいメンバーがいるボイスチャンネルを指定するでし！',
            });
            return;
        }

        const author = await searchAPIMemberById(guild, interaction.member.user.id);
        assertExistCheck(author, 'author');
        const members = voiceChannel.members;

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
        if (sendChannel.isTextBased()) {
            await sendChannel.send({ content: mentions, embeds: [embed] });
        }
    } catch (error) {
        logger.error(error);
        if (exists(interaction.channel) && interaction.channel.isTextBased()) {
            await interaction.channel.send('なんかエラー出てるわ');
        }
    }
}

async function createEmbed(author: GuildMember, text: string, createdAt: Date) {
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
