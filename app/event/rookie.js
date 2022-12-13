const Discord = require('discord.js');
const MembersService = require('../../db/members_service.js');
const { searchMemberById } = require('../manager/memberManager');
module.exports = async function removeRookie(msg) {
    const dt = new Date();
    const guild = msg.guild;
    const lastMonth = dt.setMonth(dt.getMonth() - 1);
    const member = await searchMemberById(guild, msg.author.id);
    const beginnerRoleId = process.env.ROOKIE_ROLE_ID;
    const messageCount = await getMessageCount(msg.member.id);
    if (msg.member.joinedTimestamp < lastMonth || messageCount > 99) {
        const hasBeginnerRole = member.roles.cache.find((role) => role.id === beginnerRoleId);
        if (hasBeginnerRole) {
            msg.member.roles.remove([beginnerRoleId]);
            const embed = new Discord.EmbedBuilder();
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
    const result = await MembersService.getMemberByUserId(id);
    if (result[0] != null) {
        return result[0].message_count;
    }
    return 0;
}
