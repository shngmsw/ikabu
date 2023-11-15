// Discord bot implements
import cron from 'cron';
import {
    ActivityType,
    AnyThreadChannel,
    AutocompleteInteraction,
    CacheType,
    Client,
    ClientUser,
    DMChannel,
    GatewayIntentBits,
    Guild,
    GuildMember,
    Interaction,
    Message,
    MessageReaction,
    NonThreadGuildBasedChannel,
    PartialGuildMember,
    PartialMessageReaction,
    PartialUser,
    Partials,
    Role,
    User,
    VoiceState,
} from 'discord.js';

import { updateLocale, updateSchedule } from './common/apis/splatoon3.ink/splatoon3_ink';
import { searchChannelById } from './common/manager/channel_manager';
import { searchAPIMemberById } from './common/manager/member_manager';
import { assertExistCheck, exists, notExists } from './common/others';
import { ChannelKeySet } from './constant/channel_key';
import {
    deleteChannel,
    saveChannel,
    saveChannelAtLaunch,
} from './event/channel_related/store_channel';
import { subscribeSplatEventMatch } from './event/cron/event_match_register';
import { stageInfo } from './event/cron/stageinfo';
import { emojiCountDown, emojiCountUp } from './event/reaction_count/reactions';
import {
    deleteRole,
    saveRole,
    saveRoleAtLaunch,
    updateGuildRoles,
} from './event/role_related/store_role';
import { guildMemberAddEvent } from './event/rookie/set_rookie';
import { editThreadTag } from './event/support_auto_tag/edit_tag';
import { sendCloseButton } from './event/support_auto_tag/send_support_close_button';
import { checkCallMember } from './event/voice_count/voice_count';
import * as buttonHandler from './handlers/button_handler';
import * as commandHandler from './handlers/command_handler';
import * as contextHandler from './handlers/context_handler';
import * as messageHandler from './handlers/message_handler';
import * as modalHandler from './handlers/modal_handler';
import * as vcStateUpdateHandler from './handlers/vcState_update_handler';
import { sendErrorLogs } from './logs/error/send_error_logs';
import { MemberService } from '../db/member_service';
import { ParticipantService } from '../db/participant_service';
import { UniqueChannelService } from '../db/unique_channel_service';
import { log4js_obj } from '../log4js_settings';
import { registerSlashCommands } from '../register';

export const client = new Client({
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
    partials: [
        Partials.User,
        Partials.GuildMember,
        Partials.Message,
        Partials.Channel,
        Partials.Reaction,
    ],
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
            setEnrollmentCount(client.user, guild);
        }
        await guildMemberAddEvent(member); // 10分待つ可能性があるので最後に処理
    } catch (error) {
        const loggerMA = log4js_obj.getLogger('guildMemberAdd');
        await sendErrorLogs(loggerMA, error);
    }
});

client.on('guildMemberRemove', async (member: GuildMember | PartialGuildMember) => {
    const loggerMR = log4js_obj.getLogger('guildMemberRemove');
    try {
        const displayName = member.displayName;
        const username = member.user.username;
        let joinedAt = member.joinedAt;
        // joinedAtがnullだったらDBからとってくる
        if (notExists(joinedAt)) {
            const storedMember = await MemberService.getMemberByUserId(
                member.guild.id,
                member.user.id,
            );
            if (exists(storedMember)) {
                joinedAt = storedMember.joinedAt;
            }
        }

        let text = `${displayName}たん \`[${username}]\`が退部したでし！\n`;

        if (exists(joinedAt)) {
            const unixJoinedAt = Math.floor(joinedAt.getTime() / 1000);
            const period = Math.round((Date.now() - Number(joinedAt)) / 86400000); // サーバーに居た期間を日数にして計算
            text += `入部日: <t:${unixJoinedAt}:f>【<t:${unixJoinedAt}:R>】\n入部期間: \`${period}日間\``;
        } else {
            text += '入部日を取得できなかったでし！';
        }

        const guild = await member.guild.fetch();

        const logChannelId = await UniqueChannelService.getChannelIdByKey(
            guild.id,
            ChannelKeySet.RetireLog.key,
        );
        if (notExists(logChannelId)) {
            return logger.warn(`${ChannelKeySet.RetireLog.key} is not set. [${guild.name}]`);
        }
        const retireLog = await searchChannelById(guild, logChannelId);
        if (retireLog?.isTextBased()) {
            await retireLog.send(text);
        }

        if (guild.id === process.env.SERVER_ID) {
            assertExistCheck(client.user, 'client.user');
            setEnrollmentCount(client.user, guild);
        }
    } catch (error) {
        await sendErrorLogs(loggerMR, error);
    }
});

client.on(
    'guildMemberUpdate',
    async (oldMember: GuildMember | PartialGuildMember, newMember: GuildMember) => {
        const loggerMU = log4js_obj.getLogger('guildMemberUpdate');
        try {
            const guild = await newMember.guild.fetch();
            await updateGuildRoles(guild);

            const userId = newMember.user.id;

            // 不完全なメンバーの場合を想定して、メンバー情報を取得し直す
            const member = (await searchAPIMemberById(guild, userId)) ?? newMember;

            assertExistCheck(member.joinedAt, 'joinedAt');

            // DBのメンバー情報を更新(ない場合は作成)
            const storedMember = await MemberService.saveMemberFromGuildMember(member);

            if (notExists(storedMember)) {
                return await sendErrorLogs(
                    loggerMU,
                    `failed to set member to DB. userId: ${userId}, guildId: ${guild.id}`,
                );
            }
        } catch (error) {
            await sendErrorLogs(loggerMU, error);
        }
    },
);

client.on('userUpdate', async (oldUser: User | PartialUser, newUser: User) => {
    const loggerUU = log4js_obj.getLogger('userUpdate');

    try {
        const userId = newUser.id;

        const guildIdList = await MemberService.getMemberGuildIdsByUserId(userId);
        for (const guildId of guildIdList) {
            const guild = await client.guilds.fetch(guildId);

            const member = await searchAPIMemberById(guild, userId);

            // 他鯖のテーブルには存在するが、実際には鯖から抜けている場合
            if (notExists(member)) return;

            // DBのメンバー情報を更新(ない場合は作成)
            const storedMember = await MemberService.saveMemberFromGuildMember(member);

            if (notExists(storedMember)) {
                return await sendErrorLogs(
                    loggerUU,
                    `failed to set member to DB. userId: ${userId}, guildId: ${guildId}`,
                );
            }
        }
    } catch (error) {
        await sendErrorLogs(loggerUU, error);
    }
});

client.on('ready', async (client: Client<true>) => {
    try {
        assertExistCheck(client.user);
        logger.info(`Logged in as ${client.user.tag}!`);
        await saveChannelAtLaunch(client);
        await saveRoleAtLaunch(client);
        await registerSlashCommands();
        const guild = await client.guilds.fetch(process.env.SERVER_ID || '');
        setEnrollmentCount(client.user, guild);
        await updateSchedule();
        await updateLocale();
        await checkCallMember(guild);
        await disconnectFromVC(client);
        await ParticipantService.deleteUnuseParticipant();
    } catch (error) {
        await sendErrorLogs(logger, error);
    }
});

async function disconnectFromVC(client: Client<true>) {
    // ギルド（サーバー）ごとに処理
    client.guilds.cache.forEach(async (guild) => {
        const botMember = await searchAPIMemberById(guild, client.user.id);
        if (notExists(botMember)) return;
        // ボイスチャンネルにBotが接続しているか確認
        const voiceState = botMember.voice;
        const voiceChannel = voiceState.channel;
        if (exists(voiceChannel) && voiceChannel.isVoiceBased()) {
            logger.info(`Disconnecting from 🔊${voiceChannel.name} in ${guild.name}`);
            await voiceState.disconnect(); // ボイスチャンネルから切断
        }
    });
}

client.on(
    'messageReactionAdd',
    async (reaction: MessageReaction | PartialMessageReaction, user: User | PartialUser) => {
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
            await sendErrorLogs(loggerMRA, error);
        }
    },
);

client.on(
    'messageReactionRemove',
    async (reaction: MessageReaction | PartialMessageReaction, user: User | PartialUser) => {
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
            await sendErrorLogs(loggerMRR, error);
        }
    },
);

client.on('interactionCreate', async (interaction: Interaction<CacheType>) => {
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
            await sendErrorLogs(interactionLogger, errorDetail);
        }
    }
});

client.on('threadCreate', async (thread: AnyThreadChannel<boolean>) => {
    const supportChannelId = await UniqueChannelService.getChannelIdByKey(
        thread.guildId,
        ChannelKeySet.SupportCenter.key,
    );
    if (exists(thread.parentId) && thread.parentId === supportChannelId) {
        await editThreadTag(thread);
        await sendCloseButton(thread);
    }
});

client.on('voiceStateUpdate', (oldState: VoiceState, newState: VoiceState) => {
    void vcStateUpdateHandler.call(oldState, newState);
});

// チャンネルが作成されたとき
client.on('channelCreate', async (channel: NonThreadGuildBasedChannel) => {
    await saveChannel(channel);
});

// チャンネルが更新されたとき
client.on(
    'channelUpdate',
    async (
        oldChannel: DMChannel | NonThreadGuildBasedChannel,
        newChannel: DMChannel | NonThreadGuildBasedChannel,
    ) => {
        if (!newChannel.isDMBased()) {
            await saveChannel(newChannel);
        }
    },
);

// チャンネルが削除されたとき
client.on('channelDelete', async (channel: DMChannel | NonThreadGuildBasedChannel) => {
    if (!channel.isDMBased()) {
        await deleteChannel(channel);
    }
});

// ロールが作成されたとき
client.on('roleCreate', async (role: Role) => {
    await saveRole(role);
});

// ロールが更新されたとき
client.on('roleUpdate', async (oldRole: Role, newRole: Role) => {
    await saveRole(newRole);
});

// ロールが削除されたとき
client.on('roleDelete', async (role: Role) => {
    await deleteRole(role);
});

function setEnrollmentCount(clientUser: ClientUser, guild: Guild) {
    clientUser.setActivity(`部員数: ${guild.memberCount}人`, {
        type: ActivityType.Custom,
    });
}

// cronジョブを定義
// スプラトゥーンのスケジュール更新に合わせて2時間毎に実行する
const job = new cron.CronJob(
    '1 1-23/2 * * *',
    async () => {
        logger.info('cron job started');

        try {
            const guild = await client.guilds.fetch(process.env.SERVER_ID || '');

            // イベント作成
            // イベントマッチの作成
            await subscribeSplatEventMatch(guild);
            // ステージ情報の送信
            await stageInfo(guild);
        } catch (error) {
            await sendErrorLogs(logger, 'schedule job failed: \n' + error);
        }

        logger.info('cron job finished');
    },
    null,
    true,
    'Asia/Tokyo',
);

// cronジョブの実行を開始
job.start();
