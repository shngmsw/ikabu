const { EmbedBuilder } = require('discord.js');
const log4js = require('log4js');

module.exports = {
    tagIdsEmbed: tagIdsEmbed,
};

const logger = log4js.getLogger('default');

function tagIdsEmbed(thread) {
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
