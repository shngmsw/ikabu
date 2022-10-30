const { searchChannelById } = require('../manager/channelManager');
const { searchMemberById } = require('../manager/memberManager');
const MembersService = require('../../db/members_service.js');
const { FriendCodeService } = require('../../db/friend_code_service.js');
const common = require('../common');

module.exports = async function guildMemberAddEvent(member) {
    const guild = await member.guild.fetch();
    const roles = await guild.roles.fetch();
    let robby = await searchChannelById(guild, process.env.CHANNEL_ID_ROBBY);
    let beginnerRole = roles.find((role) => role.name === '🔰新入部員');
    const rules = await searchChannelById(guild, process.env.CHANNEL_ID_RULE);
    const channelDescription = await searchChannelById(guild, process.env.CHANNEL_ID_DESCRIPTION);
    const introduction = await searchChannelById(guild, process.env.CHANNEL_ID_INTRODUCTION);

    if (
        common.isNotEmpty(robby) &&
        common.isNotEmpty(beginnerRole) &&
        common.isNotEmpty(channelDescription) &&
        common.isNotEmpty(rules) &&
        common.isNotEmpty(introduction)
    ) {
        robby
            .send(
                `<@!${member.user.id}> たん、よろしくお願いします！\n` +
                    `最初の10分間は閲覧しかできません、その間に ${rules} と ${channelDescription} をよく読んでくださいね\n` +
                    `10分経ったら、書き込めるようになります。 ${introduction} で自己紹介も兼ねて自分のフレコを貼ってください\n\n` +
                    `${guild.name}のみんなが歓迎していますよ〜`,
            )
            .then((sentMessage) => sentMessage.react('👍'))
            .catch(console.error);
    }

    const messageCount = await getMessageCount(member.id);
    const friendCode = await FriendCodeService.getFriendCodeByUserId(member.id);
    var setRookieRole = async function (beginnerRole, messageCount, friendCode) {
        if (beginnerRole) {
            if (messageCount == 0 && friendCode.length == 0) {
                const fetch_member = await searchMemberById(guild, member.id);
                if (fetch_member) {
                    fetch_member.roles.set([beginnerRole.id]).catch(console.error);
                }
            }
        }
    };
    setTimeout(async function () {
        await setRookieRole(beginnerRole, messageCount, friendCode);
    }, 600 * 1000);
};

async function getMessageCount(id) {
    const result = await MembersService.getMemberByUserId(id);
    if (result[0] != null) {
        return result[0].message_count;
    }
    return 0;
}
