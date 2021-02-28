const getMember = require("../db/members_select.js");
const getFC = require("../db/fc_select.js");

module.exports = async function guildMemberAddEvent(member) {
    const guild = member.guild;
    const roby = guild.channels.cache.find(
        (channel) => channel.id === "414095683746922517"
    );
    const rules = guild.channels.cache.find(
        (channel) => channel.id === "477067128479023115"
    );
    const channelDiscription = guild.channels.cache.find(
        (channel) => channel.id === "477067552015515658"
    );
    const introduction = guild.channels.cache.find(
        (channel) => channel.id === "417591840250920971"
    );
    const beginnerRole = guild.roles.cache.find(
        (role) => role.name === "🔰新入部員"
    );
    const messageCount = await getMessageCount(member.id);
    const friendCode = await getFriendCode(member.id);
    if (beginnerRole) {
        if (messageCount == 0 && friendCode.length == 0) {
            member.roles.set([beginnerRole.id]).then(console.log).catch(console.error);
        }
    }

    roby.send(
        `<@!${member.user.id}> たん、よろしくお願いします！\n` +
        `最初の10分間は閲覧しかできません、その間に ${rules} と ${channelDiscription} をよく読んでくださいね\n` +
        `10分経ったら、書き込めるようになります。 ${introduction} で自己紹介も兼ねて自分のフレコを貼ってください\n\n` +
        `${guild.name}のみんなが歓迎していますよ〜`
    )
        .then((sentMessage) => sentMessage.react("👍"));
}


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