import { Message } from 'discord.js';

import { MessageCountService } from '@/infra/db/repositories/message_count_service';

export async function chatCountUp(msg: Message<true>) {
    await MessageCountService.increment(msg.author.id);
}
