const Discord = require('discord.js');
const getMember = require('../../db/members_select.js');
const { searchMemberById } = require('../manager/memberManager');
module.exports = async function removeRookie(msg) {
    const dt = new Date();
    const lastMonth = dt.setMonth(dt.getMonth() - 1);
    const member = await searchMemberById(msg.guild, msg.author.id);
    const roles = await msg.guild.roles.fetch();
    const beginnerRole = roles.find((role) => role.name === '🔰新入部員');
    const messageCount = await getMessageCount(msg.member.id);
    if (msg.member.joinedTimestamp < lastMonth || messageCount > 99) {
        const hasBeginnerRole = member.roles.cache.find((role) => role.id === beginnerRole.id);
        if (hasBeginnerRole) {
            msg.member.roles.remove([beginnerRole.id]);
            const embed = new Discord.MessageEmbed();
            embed.setDescription('新入部員期間が終わったでし！\nこれからもイカ部心得を守ってイカ部生活をエンジョイするでし！');
            embed.setAuthor({
                name: member.displayName,
                iconURL: member.displayAvatarURL(),
            });
            msg.channel.send({ embeds: [embed] }).catch();
        }
    }
};

async function getMessageCount(id) {
    const result = await getMember(id);
    if (result[0] != null) {
        return result[0].message_count;
    }
    return 0;
}
