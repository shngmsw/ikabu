import { AttachmentBuilder, Message, PermissionsBitField } from 'discord.js';

import { MemberService } from '../../db/member_service';
import { UniqueChannelService } from '../../db/unique_channel_service';
import { UniqueRoleService } from '../../db/unique_role_service';
import { log4js_obj } from '../../log4js_settings';
import { searchAPIMemberById, searchDBMemberById } from '../common/manager/member_manager';
import { randomBool, exists, notExists } from '../common/others';
import { ChannelKeySet } from '../constant/channel_key';
import { RoleKeySet } from '../constant/role_key';
import { stageInfo } from '../event/cron/stageinfo';
import { deleteToken } from '../event/message_related/delete_token';
import { dispand } from '../event/message_related/dispander';
import { chatCountUp } from '../event/message_related/message_count';
import { removeRookie } from '../event/rookie/remove_rookie';
import { sendIntentionConfirmReply } from '../event/rookie/send_questionnaire';
import { vcToolsStickyFromMessage } from '../event/vctools_sticky/vc_tools_message';
import { sendRecruitSticky } from '../feat-recruit/sticky/recruit_sticky_messages';
import { play } from '../feat-utils/voice/tts/discordjs_voice';
import { sendErrorLogs } from '../logs/error/send_error_logs';
const logger = log4js_obj.getLogger('message');

export async function call(message: Message<true>) {
    try {
        if (message.content.startsWith('/rookie_set')) {
            // 一時的に設定用コマンドを追加
            // 次のメンテナンスで削除する
            const guild = await message.guild.fetch();
            const member = await searchAPIMemberById(guild, message.author.id);
            if (
                exists(member) &&
                member.permissions.has(PermissionsBitField.Flags.ManageChannels)
            ) {
                const rookieRoleId = await UniqueRoleService.getRoleIdByKey(
                    guild.id,
                    RoleKeySet.Rookie.key,
                );

                if (notExists(rookieRoleId)) return;

                const allMembers = await guild.members.fetch();
                const membersNum = allMembers.size;
                let count = 0;
                const sentMessage = await message.channel.send(
                    `新入部員を保存中でし！ \`${count}/${membersNum}\``,
                );
                allMembers.forEach(async (member) => {
                    await searchDBMemberById(guild, member.id);
                    if (member.roles.cache.find((role) => role.id === rookieRoleId)) {
                        await MemberService.setRookieFlag(guild.id, member.id, true);
                    } else {
                        await MemberService.setRookieFlag(guild.id, member.id, false);
                    }
                    await sentMessage.edit(`新入部員を保存中でし！ \`${++count}/${membersNum}\``);
                });
                await sentMessage.edit('新入部員をDBに保存したでし！');
            }
        }

        if (message.author.bot) {
            if (message.content.startsWith('/poll')) {
                if (message.author.username === 'ブキチ') {
                    logger.info(message.author.username);
                    await message.delete();
                }
            }
            return;
        } else {
            // ステージ情報デバッグ用
            if (message.content === 'stageinfo') {
                const guild = await message.guild.fetch();
                const member = await searchAPIMemberById(guild, message.author.id);
                if (
                    exists(member) &&
                    member.permissions.has(PermissionsBitField.Flags.ManageChannels)
                ) {
                    await stageInfo(guild);
                }
            }
            if (exists(process.env.QUESTIONNAIRE_URL)) {
                const botCommandChannelId = await UniqueChannelService.getChannelIdByKey(
                    message.guild.id,
                    ChannelKeySet.BotCommand.key,
                );
                if (message.channel.id !== botCommandChannelId && randomBool(0.00025)) {
                    await sendIntentionConfirmReply(
                        message,
                        message.author.id,
                        'QUESTIONNAIRE_URL',
                    );
                }
            }
        }
        if (message.content.match('ボーリング')) {
            await message.reply(
                '```「ボウリング」とは、前方に正三角形に並べられた10本のピンと呼ばれる棒をめがけボールを転がし、倒れたピンの数によって得られる得点を競うスポーツでし。' +
                    '専用施設のボウリング場に設置された細長いレーンの上で行われる屋内競技で、レーンの長さが約23m、ピンまでの距離は約18mで行われるのが一般的でし。' +
                    '英語では “bowling” と書き、球を意味する “ball” ではなく、ラテン語で「泡」や「こぶ」を意味する “bowl” が語源とされているでし。' +
                    '\n文部科学省は国語審議会で、球技を指す場合は「ボウリング」表記を用い、掘削を意味する「ボーリング」と区別することを推奨しているでし。```',
            );
        }
        if (message.content.match('お前を消す方法')) {
            const Kairu = new AttachmentBuilder('./images/Kairu.png');
            await message.reply({ files: [Kairu] });
        }

        await deleteToken(message);
        await dispand(message);
        await chatCountUp(message);
        await sendRecruitSticky({ message: message });
        await vcToolsStickyFromMessage(message);
        await removeRookie(message);
        await play(message);
    } catch (error) {
        await sendErrorLogs(logger, error);
    }
}
