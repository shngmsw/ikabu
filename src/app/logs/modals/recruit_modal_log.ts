import { EmbedBuilder, Guild } from 'discord.js';
import { searchDBMemberById } from '../../common/manager/member_manager';
import { sendEmbedsWebhook } from '../../common/webhook';
import { Recruit } from '../../../db/model/recruit';
import { exists } from '../../common/others';
import { log4js_obj } from '../../../log4js_settings';

const logger = log4js_obj.getLogger('interaction');

export async function sendRecruitModalLog(interaction: $TSFixMe) {
    const guild = interaction.guild;
    const channelName = interaction.channel.name;
    const authorId = interaction.member.user.id;
    const author = await searchDBMemberById(guild, authorId);
    const components = interaction.components;
    let commandLog = '';

    for (const subcomponents of components) {
        commandLog = commandLog + subcomponents.components[0].customId + ': ' + subcomponents.components[0].value + '\n';
    }

    const embed = new EmbedBuilder();
    embed.setTitle('モーダルログ');
    if (exists(author)) {
        embed.setAuthor({
            name: `${author.displayName} [${interaction.member.user.id}]`,
            iconURL: author.iconUrl,
        });
    } else {
        logger.warn('No log generated due to missing author information');
    }
    embed.addFields([
        {
            name: '募集パラメータ',
            value: commandLog,
            inline: true,
        },
        {
            name: '使用チャンネル',
            value: channelName,
            inline: false,
        },
    ]);
    embed.setColor('#56C000');
    embed.setTimestamp(interaction.createdAt);
    await sendEmbedsWebhook(process.env.COMMAND_LOG_WEBHOOK_URL, [embed]);
}

export async function sendEditRecruitLog(guild: Guild, oldRecruitData: Recruit, newRecruitData: Recruit, editedAt: Date) {
    const recruiterId = newRecruitData.authorId;
    const recruiter = await searchDBMemberById(guild, recruiterId);

    const embed = new EmbedBuilder();
    embed.setTitle('募集内容編集ログ');
    if (exists(recruiter)) {
        embed.setAuthor({
            name: `${recruiter.displayName} [${recruiterId}]`,
            iconURL: recruiter.iconUrl,
        });
    } else {
        logger.warn('No log generated due to missing author information');
    }
    embed.addFields([
        {
            name: '募集人数',
            value: oldRecruitData.recruitNum + ' -> ' + newRecruitData.recruitNum,
            inline: true,
        },
        {
            name: 'FROM',
            value: oldRecruitData.condition,
            inline: false,
        },
        {
            name: 'TO',
            value: newRecruitData.condition,
            inline: false,
        },
    ]);
    embed.setColor('#0070BB');
    embed.setTimestamp(editedAt);
    await sendEmbedsWebhook(process.env.COMMAND_LOG_WEBHOOK_URL, [embed]);
}
