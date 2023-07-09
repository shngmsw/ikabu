// Discord bot implements
import { Member } from '@prisma/client';
import {
    ActivityType,
    AnyThreadChannel,
    AutocompleteInteraction,
    CacheType,
    Client,
    GatewayIntentBits,
    GuildMember,
    Interaction,
    Message,
    MessageReaction,
    PartialGuildMember,
    PartialMessageReaction,
    PartialUser,
    Partials,
    User,
    VoiceState,
} from 'discord.js';
import cron from 'node-cron';

import { updateLocale, updateSchedule } from './common/apis/splatoon3.ink/splatoon3_ink';
import { searchAPIMemberById } from './common/manager/member_manager';
import { assertExistCheck, exists, notExists } from './common/others';
import { subscribeSplatEventMatch } from './event/cron/event_match_register';
import { stageInfo } from './event/cron/stageinfo';
import { emojiCountDown, emojiCountUp } from './event/reaction_count/reactions';
import { guildMemberAddEvent } from './event/rookie/set_rookie';
import { editThreadTag } from './event/support_auto_tag/edit_tag';
import { sendCloseButton } from './event/support_auto_tag/send_support_close_button';
import * as buttonHandler from './handlers/button_handler';
import * as commandHandler from './handlers/command_handler';
import * as contextHandler from './handlers/context_handler';
import * as messageHandler from './handlers/message_handler';
import * as modalHandler from './handlers/modal_handler';
import * as vcStateUpdateHandler from './handlers/vcState_update_handler';
import { MemberService } from '../db/member_service';
import { ParticipantService } from '../db/participant_service';
import { log4js_obj } from '../log4js_settings';
import { registerSlashCommands } from '../register';

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildModeration,
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildScheduledEvents,
    ],
    partials: [Partials.User, Partials.GuildMember, Partials.Message, Partials.Channel, Partials.Reaction],
});

void client.login(process.env.DISCORD_BOT_TOKEN);

const logger = log4js_obj.getLogger();

client.on('messageCreate', async (message: Message<boolean>) => {
    if (message.inGuild()) {
        void messageHandler.call(message);
    }
});

client.on('guildMemberAdd', async (member: GuildMember) => {
    try {
        const guild = await member.guild.fetch();
        if (notExists(client.user)) {
            throw new Error('client.user is null');
        }
        if (guild.id === process.env.SERVER_ID) {
            client.user.setActivity(`${guild.memberCount}人`, {
                type: ActivityType.Playing,
            });
        }
        await guildMemberAddEvent(member); // 10分待つ可能性があるので最後に処理
    } catch (error) {
        const loggerMA = log4js_obj.getLogger('guildMemberAdd');
        loggerMA.error(error);
    }
});

client.on('guildMemberRemove', async (member: GuildMember | PartialGuildMember) => {
    try {
        const tag = member.user.tag;
        let joinedAt = member.joinedAt;
        // joinedAtがnullだったらDBからとってくる
        if (notExists(joinedAt)) {
            const dbMember = await MemberService.getMemberByUserId(member.guild.id, member.user.id);
            if (exists(dbMember)) {
                joinedAt = dbMember.joinedAt;
            }
        }

        let text = `\`${tag}\`たんが退部したでし！\n`;

        if (exists(joinedAt)) {
            const unixJoinedAt = Math.floor(joinedAt.getTime() / 1000);
            const period = Math.round((Date.now() - Number(joinedAt)) / 86400000); // サーバーに居た期間を日数にして計算
            text += `入部日: <t:${unixJoinedAt}:f>【<t:${unixJoinedAt}:R>】\n入部期間: \`${period}日間\``;
        } else {
            text += '入部日を取得できなかったでし！';
        }

        assertExistCheck(process.env.CHANNEL_ID_RETIRE_LOG);
        const retireLog = member.guild.channels.cache.get(process.env.CHANNEL_ID_RETIRE_LOG);
        if (retireLog?.isTextBased()) {
            await retireLog.send(text);
        }

        const guild = await member.guild.fetch();
        if (guild.id === process.env.SERVER_ID) {
            assertExistCheck(client.user, 'client.user');
            client.user.setActivity(`${guild.memberCount}人`, {
                type: ActivityType.Playing,
            });
        }
    } catch (err) {
        const loggerMR = log4js_obj.getLogger('guildMemberRemove');
        loggerMR.error({ err });
    }
});

client.on('guildMemberUpdate', async (oldMember: GuildMember | PartialGuildMember, newMember: GuildMember) => {
    try {
        const guild = await newMember.guild.fetch();
        const userId = newMember.user.id;
        let member: GuildMember | null = newMember;

        member = await searchAPIMemberById(guild, userId);

        assertExistCheck(member, 'member');
        assertExistCheck(member.joinedAt, 'joinedAt');

        const updateMember: Member = {
            guildId: guild.id,
            userId: userId,
            displayName: member.displayName,
            iconUrl: member.displayAvatarURL().replace('.webp', '.png').replace('.webm', '.gif'),
            joinedAt: member.joinedAt,
        };

        // membersテーブルにレコードがあるか確認
        if (notExists(await MemberService.getMemberByUserId(guild.id, userId))) {
            await MemberService.registerMember(updateMember);
        } else {
            await MemberService.updateMemberProfile(updateMember);
        }
    } catch (err) {
        const loggerMU = log4js_obj.getLogger('guildMemberUpdate');
        loggerMU.error({ err });
    }
});

client.on('userUpdate', async (oldUser: User | PartialUser, newUser: User) => {
    try {
        const userId = newUser.id;

        const guildIdList = await MemberService.getMemberGuildIdsByUserId(userId);
        for (const guildId of guildIdList) {
            const guild = await client.guilds.fetch(guildId);

            const member = await searchAPIMemberById(guild, userId);

            assertExistCheck(member, 'member');

            const updateMember: Member = {
                guildId: guildId,
                userId: userId,
                displayName: member.displayName,
                iconUrl: member.displayAvatarURL().replace('.webp', '.png').replace('.webm', '.gif'),
                joinedAt: member.joinedAt,
            };

            // プロフィールアップデート
            await MemberService.updateMemberProfile(updateMember);
        }
    } catch (err) {
        const loggerUU = log4js_obj.getLogger('userUpdate');
        loggerUU.error({ err });
    }
});

client.on('ready', async () => {
    try {
        assertExistCheck(client.user);
        logger.info(`Logged in as ${client.user.tag}!`);
        // ready後にready以前に実行されたinteractionのinteractionCreateがemitされるが、
        // そのときにはinteractionがtimeoutしておりfollowupで失敗することがよくある。
        // そのようなことを避けるためready内でハンドラを登録する。
        // client.on('interactionCreate', (interaction) => onInteraction(interaction).catch((err) => logger.error(err)));
        await registerSlashCommands();
        const guild = await client.guilds.fetch(process.env.SERVER_ID || '');
        client.user.setActivity(`${guild.memberCount}人`, {
            type: ActivityType.Playing,
        });
        await updateSchedule();
        await updateLocale();
        await ParticipantService.deleteUnuseParticipant();
    } catch (error) {
        logger.error(error);
    }
});

client.on('messageReactionAdd', async (reaction: MessageReaction | PartialMessageReaction, user: User | PartialUser) => {
    const loggerMRA = log4js_obj.getLogger('messageReactionAdd');
    try {
        // When a reaction is received, check if the structure is partial
        if (reaction.partial) {
            // If the message this reaction belongs to was removed, the fetching might result in an API error which should be handled
            reaction = await reaction.fetch();
        }

        if (user.partial) {
            user = await user.fetch();
        }

        if (user.bot) {
            return;
        }

        await emojiCountUp(reaction, user);
    } catch (error) {
        loggerMRA.error(error);
    }
});

client.on('messageReactionRemove', async (reaction: MessageReaction | PartialMessageReaction, user: User | PartialUser) => {
    try {
        if (reaction.partial) {
            reaction = await reaction.fetch();
        }

        if (user.partial) {
            user = await user.fetch();
        }

        if (user.bot) {
            return;
        }

        await emojiCountDown(reaction, user);
    } catch (error) {
        const loggerMRR = log4js_obj.getLogger('messageReactionRemove');
        loggerMRR.error(error);
    }
});

client.on('interactionCreate', (interaction: Interaction<CacheType>) => {
    try {
        if (interaction.isRepliable()) {
            // 各handlerの内どれかしか呼ばれないためawaitしない
            if (interaction.isButton()) {
                void buttonHandler.call(interaction);
            } else if (interaction.isModalSubmit()) {
                void modalHandler.call(interaction);
            } else if (interaction.isMessageContextMenuCommand()) {
                void contextHandler.call(interaction);
            } else if (interaction.isUserContextMenuCommand()) {
                // interaction.isCommand()はcontextMenu系も含むため条件分岐しておく
            } else if (interaction.isChatInputCommand()) {
                void commandHandler.call(interaction);
            }
        }
    } catch (error) {
        const interactionLogger = log4js_obj.getLogger('interaction');
        if (!(interaction instanceof AutocompleteInteraction)) {
            const errorDetail = {
                content: `Command failed: ${error}`,
                interaction_replied: interaction.replied,
                interaction_deferred: interaction.deferred,
            };
            interactionLogger.error(errorDetail);
        }
    }
});

client.on('threadCreate', async (thread: AnyThreadChannel<boolean>) => {
    if (exists(thread.parentId) && thread.parentId === process.env.CHANNEL_ID_SUPPORT_CENTER) {
        await editThreadTag(thread);
        await sendCloseButton(thread);
    }
});

client.on('voiceStateUpdate', (oldState: VoiceState, newState: VoiceState) => {
    void vcStateUpdateHandler.call(oldState, newState);
});

// cronジョブを定義
// スプラトゥーンのスケジュール更新に合わせて2時間毎に実行する
const job = cron.schedule('1 1-23/2 * * *', async () => {
    logger.info('cron job started');

    try {
        const guild = await client.guilds.fetch(process.env.SERVER_ID || '');

        // イベント作成
        // イベントマッチの作成
        await subscribeSplatEventMatch(guild);
        // ステージ情報の送信
        await stageInfo(guild);
    } catch (error) {
        logger.error('schedule job failed:', error);
    }

    logger.info('cron job finished');
});

// cronジョブの実行を開始
job.start();
