import { PermissionsBitField, AttachmentBuilder, Message } from 'discord.js';

import { log4js_obj } from '../../log4js_settings';
import { randomBool, isNotEmpty } from '../common/others';
import { deleteToken } from '../event/message_related/delete_token';
import { dispand } from '../event/message_related/dispander';
import { chatCountUp } from '../event/message_related/message_count';
import { removeRookie } from '../event/rookie/remove_rookie';
import { sendIntentionConfirmReply } from '../event/rookie/send_questionnaire';
import { sendRecruitSticky } from '../feat-recruit/sticky/recruit_sticky_messages';
import { handleStageInfo } from '../feat-utils/splat3/stageinfo';
import { play } from '../feat-utils/voice/tts/discordjs_voice';
const logger = log4js_obj.getLogger('message');

export async function call(message: Message<boolean>) {
    try {
        if (message.author.bot) {
            if (message.content.startsWith('/poll')) {
                if (message.author.username === 'ブキチ') {
                    logger.info(message.author.username);
                    await message.delete();
                }
            }
            // ステージ情報
            if (message.content === 'stageinfo') {
                handleStageInfo(message);
            }
            return;
        } else {
            if (!message.inGuild()) return;
            // ステージ情報デバッグ用
            if (message.content === 'stageinfo') {
                const guild = await message.guild.fetch();
                const member = await guild.members.fetch(message.author.id);
                if (member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
                    handleStageInfo(message);
                }
            }

            if (isNotEmpty(process.env.QUESTIONNAIRE_URL)) {
                if (message.channel.id != process.env.CHANNEL_ID_BOT_CMD && randomBool(0.00025)) {
                    await sendIntentionConfirmReply(message, message.author, 'QUESTIONNAIRE_URL');
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
        await play(message);
        await chatCountUp(message);
        await sendRecruitSticky({ message: message });
        await removeRookie(message);
    } catch (error) {
        logger.error(error);
    }
}
