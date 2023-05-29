// Discord bot implements
import {
    ActivityType,
    AutocompleteInteraction,
    BaseGuildTextChannel,
    CacheType,
    Client,
    GatewayIntentBits,
    GuildMember,
    Interaction,
    PartialGuildMember,
    PartialUser,
    Partials,
    User,
} from 'discord.js';
import { DBCommon } from '../db/db';
import { MembersService } from '../db/members_service';
import { FriendCodeService } from '../db/friend_code_service';
import { MessageCountService } from '../db/message_count_service';
import { RecruitService } from '../db/recruit_service';
import { TeamDividerService } from '../db/team_divider_service';
import { log4js_obj } from '../log4js_settings';
import { updateSchedule } from './common/apis/splatoon3_ink';
import { emojiCountUp } from './event/reaction_count/reactions';
import { guildMemberAddEvent } from './event/rookie/set_rookie';
import * as message_handler from './handlers/message_handler';
import * as button_handler from './handlers/button_handler';
import * as modal_handler from './handlers/modal_handler';
import * as context_handler from './handlers/context_handler';
import * as command_handler from './handlers/command_handler';
import * as vcState_update_handler from './handlers/vcState_update_handler';
import { assertExistCheck, exists, isNotEmpty, notExists } from './common/others';
import { editThreadTag } from './event/support_auto_tag/edit_tag';
import { sendCloseButton } from './event/support_auto_tag/send_support_close_button';
import { registerSlashCommands } from '../register';
import { searchAPIMemberById } from './common/manager/member_manager';
import { Member } from '../db/model/member';
import { ParticipantService } from '../db/participants_service';
import { StickyService } from '../db/sticky_service';
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
    ],
    partials: [Partials.User, Partials.GuildMember, Partials.Message, Partials.Channel, Partials.Reaction],
});

client.login(process.env.DISCORD_BOT_TOKEN);

const logger = log4js_obj.getLogger();

client.on('messageCreate', async (msg: $TSFixMe) => {
    message_handler.call(msg);
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
            const dbMember = await MembersService.getMemberByUserId(member.guild.id, member.user.id);
            if (dbMember.length !== 0) {
                joinedAt = dbMember[0].joinedAt;
            }
        }

        let text = `\`${tag}\`たんが退部したでし！\n`;

        if (exists(joinedAt)) {
            const period = Math.round((Date.now() - Number(joinedAt)) / 86400000); // サーバーに居た期間を日数にして計算
            text += `入部日: <t:${member.joinedAt}:f>【<t:${member.joinedAt}:R>】\n入部期間: \`${period}日間\``;
        } else {
            text += '入部日を取得できなかったでし！';
        }

        assertExistCheck(process.env.CHANNEL_ID_RETIRE_LOG);
        const retireLog = member.guild.channels.cache.get(process.env.CHANNEL_ID_RETIRE_LOG);
        if (retireLog instanceof BaseGuildTextChannel) {
            retireLog.send(text);
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

        const updateMember = new Member(
            guild.id,
            userId,
            member.displayName,
            member.displayAvatarURL().replace('.webp', '.png').replace('.webm', '.gif'),
            member.joinedAt,
        );

        // membersテーブルにレコードがあるか確認
        if ((await MembersService.getMemberByUserId(guild.id, userId)).length == 0) {
            await MembersService.registerMember(updateMember);
        } else {
            await MembersService.updateMemberProfile(updateMember);
        }
    } catch (err) {
        const loggerMU = log4js_obj.getLogger('guildMemberUpdate');
        loggerMU.error({ err });
    }
});

client.on('userUpdate', async (oldUser: User | PartialUser, newUser: User) => {
    try {
        const userId = newUser.id;

        const guildIdList = await MembersService.getMemberGuildsByUserId(userId);
        for (const guildId of guildIdList) {
            const guild = await client.guilds.fetch(guildId);
            assertExistCheck(guild, 'guild');

            const member = await searchAPIMemberById(guild, userId);

            assertExistCheck(member, 'member');

            const updateMember = new Member(
                guildId,
                userId,
                member.displayName,
                member.displayAvatarURL().replace('.webp', '.png').replace('.webm', '.gif'),
                member.joinedAt,
            );

            // プロフィールアップデート
            await MembersService.updateMemberProfile(updateMember);
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
        DBCommon.init();
        await MembersService.createTableIfNotExists();
        await StickyService.createTableIfNotExists();
        await FriendCodeService.createTableIfNotExists();
        await RecruitService.createTableIfNotExists();
        await ParticipantService.createTableIfNotExists();
        await MessageCountService.createTableIfNotExists();
        await TeamDividerService.createTableIfNotExists();
        const guild = client.user.client.guilds.cache.get(process.env.SERVER_ID || '');
        assertExistCheck(guild);
        client.user.setActivity(`${guild.memberCount}人`, {
            type: ActivityType.Playing,
        });
        updateSchedule();
    } catch (error) {
        logger.error(error);
    }
});

client.on('messageReactionAdd', async (reaction: $TSFixMe) => {
    const loggerMRA = log4js_obj.getLogger('messageReactionAdd');
    try {
        // When a reaction is received, check if the structure is partial
        if (reaction.partial) {
            // If the message this reaction belongs to was removed, the fetching might result in an API error which should be handled
            try {
                await reaction.fetch();
            } catch (error) {
                loggerMRA.error('Something went wrong when fetching the message:', error);
                return;
            }
        }
        await emojiCountUp(reaction);
    } catch (error) {
        loggerMRA.error(error);
    }
});

client.on('messageReactionRemove', async (reaction: $TSFixMe, user: $TSFixMe) => {
    try {
        if (!user.bot) {
            /* empty */
        }
    } catch (error) {
        const loggerMRR = log4js_obj.getLogger('messageReactionRemove');
        loggerMRR.error(error);
    }
});

client.on('interactionCreate', (interaction: Interaction<CacheType>) => {
    try {
        if (interaction.isButton()) {
            button_handler.call(interaction);
        } else if (interaction.isModalSubmit()) {
            modal_handler.call(interaction);
        } else if (interaction.isMessageContextMenuCommand()) {
            context_handler.call(interaction);
        } else if (interaction.isUserContextMenuCommand()) {
            // interaction.isCommand()はcontextMenu系も含むため条件分岐しておく
        } else if (interaction.isCommand()) {
            command_handler.call(interaction);
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

client.on('threadCreate', async (thread: $TSFixMe) => {
    if (isNotEmpty(thread.parentId) && thread.parentId === process.env.CHANNEL_ID_SUPPORT_CENTER) {
        editThreadTag(thread);
        sendCloseButton(thread);
    }
});

client.on('voiceStateUpdate', (oldState: $TSFixMe, newState: $TSFixMe) => {
    vcState_update_handler.call(oldState, newState);
});
