const root = require('app-root-path');
const getMember = require(root + '/db/members_select.js');
const getFC = require(root + '/db/fc_select.js');
const common = require(root + '/app/common.js');

module.exports = async function guildMemberAddEvent(member) {
    const guild = member.guild;
    const channels = await guild.channels.fetch();
    const roles = await guild.roles.fetch();
    let robby = channels.find((channel) => channel.id === process.env.CHANNEL_ID_ROBBY);
    let beginnerRole = roles.find((role) => role.name === '🔰新入部員');
    const rules = channels.find((channel) => channel.id === process.env.CHANNEL_ID_RULE);
    const channelDescription = channels.find((channel) => channel.id === process.env.CHANNEL_ID_DESCRIPTION);
    const introduction = channels.find((channel) => channel.id === process.env.CHANNEL_ID_INTRODUCTION);

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
    const friendCode = await getFriendCode(member.id);
    var setRookieRole = function (beginnerRole, messageCount, friendCode) {
        if (beginnerRole) {
            if (messageCount == 0 && friendCode.length == 0) {
                member.roles.set([beginnerRole.id]).catch(console.error);
            }
        }
    };
    setTimeout(function () {
        setRookieRole(beginnerRole, messageCount, friendCode);
    }, 600 * 1000);
};

async function getMessageCount(id) {
    const result = await getMember(id);
    if (result[0] != null) {
        return result[0].message_count;
    }
    return 0;
}

async function getFriendCode(id) {
    return await getFC(id);
}
