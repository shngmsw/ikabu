// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'EmbedBuild... Remove this comment to see the full error message
const { EmbedBuilder, ChannelType } = require('discord.js');
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'log4js'.
const log4js = require('log4js');
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'isNotEmpty... Remove this comment to see the full error message
const { isNotEmpty, isEmpty } = require('../../common/others');
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'searchChan... Remove this comment to see the full error message
const { searchChannelById } = require('../../common/manager/channel_manager');
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'searchMemb... Remove this comment to see the full error message
const { searchMemberById, getMemberColor } = require('../../common/manager/member_manager');

// @ts-expect-error TS(2552): Cannot find name 'module'. Did you mean 'mode'?
module.exports = {
    voiceMention: voiceMention,
};

// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'voiceMenti... Remove this comment to see the full error message
async function voiceMention(interaction: $TSFixMe) {
    // @ts-expect-error TS(2580): Cannot find name 'process'. Do you need to install... Remove this comment to see the full error message
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

// @ts-expect-error TS(2393): Duplicate function implementation.
async function createEmbed(author: $TSFixMe, text: $TSFixMe, createdAt: $TSFixMe) {
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
