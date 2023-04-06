import { MessageCountService } from '../../../db/message_count_service';
import { MessageCount } from '../../../db/model/message_count';

export async function chatCountUp(msg: $TSFixMe) {
    const id = msg.author.id;
    // membersテーブルがなければ作る
    await MessageCountService.createTableIfNotExists();
    const messageCount = await getMessageCount(id);
    await MessageCountService.save(id, messageCount);
}

async function getMessageCount(id: $TSFixMe) {
    let messageCount = 0;
    const result: MessageCount[] = await MessageCountService.getMemberByUserId(id);
    if (result[0] != null) {
        messageCount = result[0].count + 1;
    }
    return messageCount;
}
