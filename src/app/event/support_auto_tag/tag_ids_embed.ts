import { AnyThreadChannel, ChannelType, EmbedBuilder } from 'discord.js';

import { log4js_obj } from '../../../log4js_settings';
import { assertExistCheck } from '../../common/others';

const logger = log4js_obj.getLogger('default');

export function tagIdsEmbed(thread: AnyThreadChannel<true>) {
    try {
        let description = '管理者は環境変数に対応中タグのIDと回答済みタグのIDを設定するでし！\n';

        assertExistCheck(thread.parent, 'thread.parent');
        const parentChannel = thread.parent;
        if (parentChannel.type !== ChannelType.GuildForum) return null;
        const tags = parentChannel.availableTags;
        for (const tag of tags) {
            description = description + tag.name + ': `' + tag.id + '`\n';
        }

        const embed = new EmbedBuilder();
        embed.setTitle('サポートセンタータグIDの設定');
        embed.setDescription(description);
        return embed;
    } catch (error) {
        logger.error(error);
        return null;
    }
}
