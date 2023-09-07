import { ChatInputCommandInteraction } from 'discord.js';

import { MemberService } from '../../../db/member_service';
import { log4js_obj } from '../../../log4js_settings';
import { getGuildByInteraction } from '../../common/manager/guild_manager';
import { searchAPIMemberById, searchDBMemberById } from '../../common/manager/member_manager';
import { assertExistCheck, exists, notExists } from '../../common/others';
import { sendErrorLogs } from '../../logs/error/send_error_logs';

const logger = log4js_obj.getLogger('interaction');

export async function joinedAtFixer(interaction: ChatInputCommandInteraction<'cached' | 'raw'>) {
    try {
        if (notExists(process.env.ROLE_ID_DEVELOPER)) {
            return await interaction.reply('`ROLE_ID_DEVELOPER`が環境変数に設定されてないでし！');
        }

        const guild = await getGuildByInteraction(interaction);
        const member = await searchAPIMemberById(guild, interaction.member.user.id);
        assertExistCheck(member, 'member');

        if (!member.roles.cache.has(process.env.ROLE_ID_DEVELOPER)) {
            return await interaction.reply('開発者のみが実行できるコマンドでし！');
        }

        await interaction.deferReply({ ephemeral: true });

        const targetUser = interaction.options.getUser('ユーザー', true);
        const year = interaction.options.getInteger('年', true);
        const month = interaction.options.getInteger('月', true);
        const day = interaction.options.getInteger('日', true);
        const hour = interaction.options.getInteger('時', true);
        const minute = interaction.options.getInteger('分', true);
        const second = interaction.options.getInteger('秒', false) ?? 0;
        const isForceSet = interaction.options.getBoolean('強制設定', false) ?? false;

        const targetDBMember = await searchDBMemberById(guild, targetUser.id);

        if (notExists(targetDBMember)) {
            return await interaction.editReply('対象ユーザーが見つからなかったでし！');
        }

        const newDate = new Date(year, month - 1, day, hour, minute, second);

        if (
            !isForceSet &&
            exists(targetDBMember.joinedAt) &&
            targetDBMember.joinedAt.getTime() < newDate.getTime()
        ) {
            return await interaction.editReply(
                '現在の参加日時よりも後の日時を指定することはできないでし！',
            );
        }

        await MemberService.updateJoinedAt(guild.id, targetDBMember.userId, newDate);

        return await interaction.editReply(
            '参加日時を更新したでし！\n`' +
                newDate.toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' }) +
                '`',
        );
    } catch (error) {
        await sendErrorLogs(logger, error);
    }
}
