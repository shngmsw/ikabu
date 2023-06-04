import { BaseGuildTextChannel, ButtonInteraction, ColorResolvable, EmbedBuilder } from 'discord.js';

import { Member } from '../../../db/model/member';
import { Participant } from '../../../db/model/participant';
import { assertExistCheck } from '../../common/others';
import { sendEmbedsWebhook } from '../../common/webhook';

export async function sendRecruitButtonLog(
    interaction: ButtonInteraction,
    member: Member,
    hostMember: Participant,
    buttonName: string,
    color: ColorResolvable,
) {
    const embed = new EmbedBuilder();
    if (interaction.channel instanceof BaseGuildTextChannel) {
        embed.setTitle(interaction.channel?.name + 'で' + buttonName + 'ボタンが押されたでし！');
    }
    embed.setAuthor({
        name: `${member.displayName} [${member.userId}]`,
        iconURL: member.iconUrl,
    });
    embed.setDescription('**募集主**: ' + hostMember.displayName + ' [' + hostMember.userId + ']');
    embed.setColor(color);
    embed.setTimestamp(interaction.createdAt);
    assertExistCheck(process.env.BUTTON_LOG_WEBHOOK_URL, 'BUTTON_LOG_WEBHOOK_URL');
    await sendEmbedsWebhook(process.env.BUTTON_LOG_WEBHOOK_URL, [embed]);
}
