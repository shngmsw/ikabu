const { EmbedBuilder, ChannelType } = require('discord.js');
const log4js = require('log4js');
const { isNotEmpty, isEmpty } = require('../../common');
const { searchChannelById } = require('../../manager/channelManager');
const { searchMemberById, getMemberColor } = require('../../manager/memberManager');

module.exports = {
    voiceMention: voiceMention,
};

async function voiceMention(interaction) {
    log4js.configure(process.env.LOG4JS_CONFIG_PATH);
    const logger = log4js.getLogger('interaction');

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
        const author = await searchMemberById(guild, interaction.member.user.id);
        channel = await searchChannelById(guild, channel.id);
        const members = channel.members;

        if (members.size < 1) {
            await interaction.editReply({ content: 'そのVCには誰もいないでし！' });
            return;
        }

        let mentions = '';
        for (let member of members) {
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

async function createEmbed(author, text, createdAt) {
    const embed = new EmbedBuilder();
    let color = getMemberColor(author);
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
