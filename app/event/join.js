module.exports = {
    guildMemberAddEvent: guildMemberAddEvent,
};

const { searchChannelById } = require('../manager/channelManager');
const { searchMemberById } = require('../manager/memberManager');
const MembersService = require('../../db/members_service.js');
const FriendCodeService = require('../../db/friend_code_service.js');
const { isEmpty } = require('../common');
const log4js = require('log4js');
const { searchRoleById } = require('../manager/roleManager');

log4js.configure(process.env.LOG4JS_CONFIG_PATH);
const logger = log4js.getLogger('guildMemberAdd');

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function guildMemberAddEvent(member) {
    try {
        const guild = await member.guild.fetch();
        const lobby_channel = await searchChannelById(guild, process.env.CHANNEL_ID_ROBBY);
        const beginnerRole = await searchRoleById(guild, process.env.ROOKIE_ROLE_ID);

        const sentMessage = await lobby_channel.send(
            `<@!${member.user.id}> たん、よろしくお願いします！\n` +
                `最初の10分間は閲覧しかできません、その間に <#${process.env.CHANNEL_ID_RULE}> と <#${process.env.CHANNEL_ID_DESCRIPTION}> をよく読んでくださいね\n` +
                `10分経ったら、書き込めるようになります。 <#${process.env.CHANNEL_ID_INTRODUCTION}> で自己紹介も兼ねて自分のフレコを貼ってください\n\n` +
                `${guild.name}のみんなが歓迎していますよ〜`,
        );

        if (isEmpty(beginnerRole)) {
            lobby_channel.send(
                `「新入部員ロールのIDが設定されていないでし！\n気付いた方はサポートセンターまでお問合わせお願いします。」とのことでし！`,
            );
        } else {
            const messageCount = await getMessageCount(member.id);
            const friendCode = await FriendCodeService.getFriendCodeByUserId(member.id);
            await sleep(6 * 1000);
            await setRookieRole(guild, member, beginnerRole, messageCount, friendCode);
            await sentMessage.react('👍');
        }
    } catch (error) {
        logger.error(error);
    }
}

async function setRookieRole(guild, member, beginnerRole, messageCount, friendCode) {
    if (messageCount < 100 && friendCode.length == 0) {
        const fetch_member = await searchMemberById(guild, member.id);
        if (fetch_member) {
            fetch_member.roles.set([beginnerRole.id]).catch((error) => {
                logger.error(error);
            });
        }
    }
}

async function getMessageCount(id) {
    const result = await MembersService.getMemberByUserId(id);
    if (result[0] != null) {
        return result[0].message_count;
    }
    return 0;
}
