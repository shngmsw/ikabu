import { Message } from 'discord.js';

import { MessageCountService } from '../../../db/message_count_service';
import { MessageCount } from '../../../db/model/message_count';
import { exists } from '../../common/others';

export async function chatCountUp(msg: Message<true>) {
    const id = msg.author.id;
    // message_countsテーブルがなければ作る
    await MessageCountService.createTableIfNotExists();
    const messageCount = await getMessageCount(id);
    await MessageCountService.save(id, messageCount);
}

async function getMessageCount(id: string) {
    let messageCount = 0;
    const result: MessageCount[] = await MessageCountService.getMemberByUserId(id);
    if (exists(result[0])) {
        messageCount = result[0].count + 1;
    }
    return messageCount;
}
