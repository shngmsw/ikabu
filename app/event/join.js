const getMember = require('../../db/members_select.js');
const getFC = require('../../db/fc_select.js');
const common = require('../common.js');

module.exports = async function guildMemberAddEvent(member) {
    const guild = member.guild;
    let roby = guild.channels.cache.find((channel) => channel.id === process.env.CHANNEL_ID_ROBY);
    if (common.isEmpty(roby)) {
        roby = await guild.channels.fetch(process.env.CHANNEL_ID_ROBY);
    }

    const rules = guild.channels.cache.find((channel) => channel.id === process.env.CHANNEL_ID_RULE);
    const channelDiscription = guild.channels.cache.find((channel) => channel.id === process.env.CHANNEL_ID_DISCRIPTION);
    const introduction = guild.channels.cache.find((channel) => channel.id === process.env.CHANNEL_ID_INTRODUCTION);
    let beginnerRole = guild.roles.cache.find((role) => role.name === '🔰新入部員');
    if (common.isEmpty(beginnerRole)) {
        beginnerRole = await guild.roles.fetch('🔰新入部員');
    }

    roby.send(
        `<@!${member.user.id}> よろしくお願いします！\n` +
            `最初の10分間は閲覧しかできません、その間に ${rules} と ${channelDiscription} をよく読んでくださいね\n` +
            `イカ部心得を読まずに違反するような悪い子は即BANするから言動には気をつけろよ！でし！\n` +
            `10分経ったら、書き込めるようになります。 ${introduction} で自己紹介も兼ねて自分のフレコを貼ってください\n\n` +
            `${guild.name}のみんなが~~監視~~歓迎していますよ〜`,
    )
        .then((sentMessage) => sentMessage.react('👍'))
        .catch(console.error);

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
