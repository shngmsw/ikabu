import { BaseGuildTextChannel, ButtonInteraction, ColorResolvable, EmbedBuilder } from 'discord.js';
import { sendEmbedsWebhook } from '../../common/webhook';
import { Member } from '../../../db/model/member';

export async function sendRecruitButtonLog(
    interaction: ButtonInteraction,
    member: Member,
    host_member: Member,
    button_name: string,
    color: ColorResolvable,
) {
    const embed = new EmbedBuilder();
    if (interaction.channel instanceof BaseGuildTextChannel) {
        embed.setTitle(interaction.channel?.name + 'で' + button_name + 'ボタンが押されたでし！');
    }
    embed.setAuthor({
        name: `${member.display_name} [${member.user_id}]`,
        iconURL: member.icon_url,
    });
    embed.setDescription('**募集主**: ' + host_member.display_name + ' [' + host_member.user_id + ']');
    embed.setColor(color);
    embed.setTimestamp(interaction.createdAt);
    await sendEmbedsWebhook(process.env.BUTTON_LOG_WEBHOOK_URL, [embed]);
}
