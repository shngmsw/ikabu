import { log4js_obj } from '../../log4js_settings';

import { PermissionsBitField, AttachmentBuilder } from 'discord.js';
import { handleStageInfo } from '../feat-utils/splat3/stageinfo';
import { randomBool, isNotEmpty } from '../common/others';
import { removeRookie } from '../event/rookie/remove_rookie';
import { chatCountUp } from '../event/message_related/members';
import { deleteToken } from '../event/message_related/delete_token';
import { sendIntentionConfirmReply } from '../event/rookie/send_questionnaire';
import { dispand } from '../event/message_related/dispander';
import { play } from '../feat-utils/voice/tts/discordjs_voice';
const logger = log4js_obj.getLogger('message');

export async function call(message: $TSFixMe) {
    try {
        if (message.author.bot) {
            if (message.content.startsWith('/poll')) {
                if (message.author.username === 'ブキチ') {
                    logger.info(message.author.username);
                    message.delete();
                }
            }
            // ステージ情報
            if (message.content === 'stageinfo') {
                handleStageInfo(message);
            }
            return;
        } else {
            // ステージ情報デバッグ用
            if (message.content === 'stageinfo') {
                const guild = await message.guild.fetch();
                const member = await guild.members.fetch(message.author.id, {
                    force: true, // intentsによってはGuildMemberUpdateが配信されないため
                });
                if (member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
                    handleStageInfo(message);
                }
            }

            if (isNotEmpty(process.env.QUESTIONNAIRE_URL)) {
                if (message.channel.id != process.env.CHANNEL_ID_BOT_CMD && randomBool(0.00025)) {
                    sendIntentionConfirmReply(message, message.author, 'QUESTIONNAIRE_URL');
                }
            }
        }
        if (message.content.match('ボーリング')) {
            message.reply(
                '```「ボウリング」とは、前方に正三角形に並べられた10本のピンと呼ばれる棒をめがけボールを転がし、倒れたピンの数によって得られる得点を競うスポーツでし。' +
                    '専用施設のボウリング場に設置された細長いレーンの上で行われる屋内競技で、レーンの長さが約23m、ピンまでの距離は約18mで行われるのが一般的でし。' +
                    '英語では “bowling” と書き、球を意味する “ball” ではなく、ラテン語で「泡」や「こぶ」を意味する “bowl” が語源とされているでし。' +
                    '\n文部科学省は国語審議会で、球技を指す場合は「ボウリング」表記を用い、掘削を意味する「ボーリング」と区別することを推奨しているでし。```',
            );
        }
        if (message.content.match('お前を消す方法')) {
            const Kairu = new AttachmentBuilder('./images/Kairu.png');
            message.reply({ files: [Kairu] });
        }

        await deleteToken(message);
        dispand(message);
        play(message);
        await chatCountUp(message);
        removeRookie(message);
    } catch (error) {
        logger.error(error);
    }
}
