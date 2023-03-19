// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'EmbedBuild... Remove this comment to see the full error message
const { EmbedBuilder } = require('discord.js');
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'log4js'.
const log4js = require('log4js');

// @ts-expect-error TS(2552): Cannot find name 'module'. Did you mean 'mode'?
module.exports = {
    tagIdsEmbed: tagIdsEmbed,
};

// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'logger'.
const logger = log4js.getLogger('default');

// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'tagIdsEmbe... Remove this comment to see the full error message
function tagIdsEmbed(thread: $TSFixMe) {
    try {
        let description = '管理者は環境変数に対応中タグのIDと回答済みタグのIDを設定するでし！\n';

        const tags = thread.parent.availableTags;
        for (let tag of tags) {
            description = description + tag.name + ': `' + tag.id + '`\n';
        }

        const embed = new EmbedBuilder();
        embed.setTitle('サポートセンタータグIDの設定');
        embed.setDescription(description);
        return embed;
    } catch (error) {
        logger.error(error);
    }
}
