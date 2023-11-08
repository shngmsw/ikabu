import {
    CacheType,
    ChatInputCommandInteraction,
    Collection,
    ColorResolvable,
    EmbedBuilder,
    Guild,
    GuildMember,
    PermissionsBitField,
    Role,
    TextBasedChannel,
    VoiceChannel,
} from 'discord.js';

import { ParticipantService } from '../../../../db/participant_service';
import { RecruitService, RecruitType } from '../../../../db/recruit_service';
import { UniqueRoleService } from '../../../../db/unique_role_service';
import { log4js_obj } from '../../../../log4js_settings';
import { getGuildByInteraction } from '../../../common/manager/guild_manager';
import { searchAPIMemberById, searchDBMemberById } from '../../../common/manager/member_manager';
import { searchMessageById } from '../../../common/manager/message_manager';
import { assertExistCheck, exists, sleep } from '../../../common/others';
import { RoleKeySet } from '../../../constant/role_key';
import { sendErrorLogs } from '../../../logs/error/send_error_logs';
import {
    embedRecruitDeleteButton,
    recruitActionRow,
    unlockChannelButton,
} from '../../buttons/create_recruit_buttons';
import { sendRecruitSticky } from '../../sticky/recruit_sticky_messages';

const logger = log4js_obj.getLogger('recruit');

export async function otherGameRecruit(interaction: ChatInputCommandInteraction<'cached' | 'raw'>) {
    assertExistCheck(interaction.channel, 'channel');

    await interaction.deferReply({ ephemeral: false });

    const guild = await getGuildByInteraction(interaction);
    const options = interaction.options;
    const member = await searchAPIMemberById(guild, interaction.member.user.id);

    assertExistCheck(member, 'member');

    const voiceChannel = interaction.options.getChannel('使用チャンネル');
    const availableChannel = [
        'alfa',
        'bravo',
        'charlie',
        'delta',
        'echo',
        'fox',
        'golf',
        'hotel',
        'india',
        'juliett',
        'kilo',
        'lima',
        'mike',
    ];

    if (voiceChannel instanceof VoiceChannel) {
        if (voiceChannel.members.size != 0 && !voiceChannel.members.has(member.user.id)) {
            await interaction.deleteReply();
            return await interaction.followUp({
                content: `\`${interaction.toString()}\`\nそのチャンネルは使用中でし！`,
                ephemeral: true,
            });
        } else if (!availableChannel.includes(voiceChannel.name)) {
            await interaction.deleteReply();
            return await interaction.followUp({
                content: `\`${interaction.toString()}\`\nそのチャンネルは指定できないでし！\n🔉alfa ～ 🔉mikeの間のチャンネルで指定するでし！`,
                ephemeral: true,
            });
        }
    }

    const roles = await guild.roles.fetch();
    const recruitChannel = interaction.channel;

    if (options.getSubcommand() === 'apex') {
        await apexLegends(interaction, guild, recruitChannel, member, roles);
    } else if (options.getSubcommand() === 'mhr') {
        await monsterHunterRise(interaction, guild, recruitChannel, member, roles);
    } else if (options.getSubcommand() === 'overwatch') {
        await overwatch(interaction, guild, recruitChannel, member, roles);
    } else if (options.getSubcommand() === 'valo') {
        await valorant(interaction, guild, recruitChannel, member, roles);
    } else if (options.getSubcommand() === 'other') {
        await others(interaction, guild, recruitChannel, member);
    }
}

async function monsterHunterRise(
    interaction: ChatInputCommandInteraction<CacheType>,
    guild: Guild,
    recruitChannel: TextBasedChannel,
    member: GuildMember,
    roles: Collection<string, Role>,
) {
    const role = roles.find((role: Role) => role.name === 'ハンター');
    if (role === undefined) {
        await sendErrorMessage(recruitChannel);
        return;
    }
    const title = 'MONSTER HUNTER RISE';
    const recruitNumText = interaction.options.getString('募集人数', true);
    const mention = role.toString();
    const txt = `### <@${member.user.id}>` + 'たんのモンハンライズ募集\n';
    const color = '#b71008';
    const image =
        'https://raw.githubusercontent.com/shngmsw/ikabu/stg/images/games/MonsterHunterRiseSunBreak.jpg';
    const logo =
        'https://raw.githubusercontent.com/shngmsw/ikabu/stg/images/games/MonsterHunterRiseSunBreak_logo.png';
    await sendOtherGames(
        interaction,
        guild,
        recruitChannel,
        member,
        title,
        recruitNumText,
        mention,
        txt,
        color,
        image,
        logo,
    );
}

async function apexLegends(
    interaction: ChatInputCommandInteraction<CacheType>,
    guild: Guild,
    recruitChannel: TextBasedChannel,
    member: GuildMember,
    roles: Collection<string, Role>,
) {
    const role = roles.find((role: Role) => role.name === 'レジェンド');
    if (role === undefined) {
        await sendErrorMessage(recruitChannel);
        return;
    }
    const title = 'Apex Legends';
    const recruitNumText = interaction.options.getString('募集人数', true);
    const mention = role.toString();
    const txt = `### <@${member.user.id}>` + 'たんのApexLegends募集\n';
    const color = '#F30100';
    const image =
        'https://raw.githubusercontent.com/shngmsw/ikabu/stg/images/games/ApexLegends.jpg';
    const logo =
        'https://raw.githubusercontent.com/shngmsw/ikabu/stg/images/games/ApexLegends_logo.png';
    await sendOtherGames(
        interaction,
        guild,
        recruitChannel,
        member,
        title,
        recruitNumText,
        mention,
        txt,
        color,
        image,
        logo,
    );
}

async function overwatch(
    interaction: ChatInputCommandInteraction<CacheType>,
    guild: Guild,
    recruitChannel: TextBasedChannel,
    member: GuildMember,
    roles: Collection<string, Role>,
) {
    const role = roles.find((role: Role) => role.name === 'ヒーロー');
    if (role === undefined) {
        await sendErrorMessage(recruitChannel);
        return;
    }
    const title = 'Overwatch2';
    const recruitNumText = interaction.options.getString('募集人数', true);
    const mention = role.toString();
    const txt = `### <@${member.user.id}>` + 'たんのOverwatch2募集\n';
    const color = '#ED6516';
    const image = 'https://raw.githubusercontent.com/shngmsw/ikabu/stg/images/games/Overwatch2.png';
    const logo =
        'https://raw.githubusercontent.com/shngmsw/ikabu/stg/images/games/Overwatch_logo.png';
    await sendOtherGames(
        interaction,
        guild,
        recruitChannel,
        member,
        title,
        recruitNumText,
        mention,
        txt,
        color,
        image,
        logo,
    );
}

async function valorant(
    interaction: ChatInputCommandInteraction<CacheType>,
    guild: Guild,
    recruitChannel: TextBasedChannel,
    member: GuildMember,
    roles: Collection<string, Role>,
) {
    const role = roles.find((role: Role) => role.name === 'エージェント');
    if (role === undefined) {
        await sendErrorMessage(recruitChannel);
        return;
    }
    const title = 'VALORANT';
    const recruitNumText = interaction.options.getString('募集人数', true);
    const mention = role.toString();
    const txt = `### <@${member.user.id}>` + 'たんのVALORANT募集\n';
    const color = '#FF4654';
    const image = 'https://raw.githubusercontent.com/shngmsw/ikabu/stg/images/games/valorant.jpg';
    const logo =
        'https://raw.githubusercontent.com/shngmsw/ikabu/stg/images/games/valorant_logo.png';
    await sendOtherGames(
        interaction,
        guild,
        recruitChannel,
        member,
        title,
        recruitNumText,
        mention,
        txt,
        color,
        image,
        logo,
    );
}

async function others(
    interaction: ChatInputCommandInteraction<CacheType>,
    guild: Guild,
    recruitChannel: TextBasedChannel,
    member: GuildMember,
) {
    const otherGamesRecruitRoleId = await UniqueRoleService.getRoleIdByKey(
        guild.id,
        RoleKeySet.OtherGamesRecruit.key,
    );

    const title = interaction.options.getString('ゲームタイトル', true);
    const recruitNumText = interaction.options.getString('募集人数', true);
    const mention = `<@&${otherGamesRecruitRoleId}>`;
    const txt = `### <@${member.user.id}>` + `たんの${title}募集\n`;
    const color = '#379C30';
    const image = 'https://raw.githubusercontent.com/shngmsw/ikabu/stg/images/games/others.jpg';
    const logo = 'https://raw.githubusercontent.com/shngmsw/ikabu/stg/images/games/others_logo.png';
    await sendOtherGames(
        interaction,
        guild,
        recruitChannel,
        member,
        title,
        recruitNumText,
        mention,
        txt,
        color,
        image,
        logo,
    );
}

async function sendOtherGames(
    interaction: ChatInputCommandInteraction<CacheType>,
    guild: Guild,
    recruitChannel: TextBasedChannel,
    member: GuildMember,
    title: string,
    recruitNumText: string,
    mention: string,
    txt: string,
    color: ColorResolvable,
    image: string,
    logo: string,
) {
    const options = interaction.options;

    const condition = options.getString('内容または参加条件') ?? 'なし';

    const reserveChannel = interaction.options.getChannel('使用チャンネル');

    const recruiter = await searchDBMemberById(guild, member.user.id);

    assertExistCheck(recruiter, 'recruiter');

    const embed = new EmbedBuilder()
        .setAuthor({
            name: recruiter.displayName,
            iconURL: recruiter.iconUrl,
        })
        .setTitle(title + '募集')
        .setColor(color)
        .addFields([
            {
                name: '募集人数',
                value: recruitNumText,
            },
            {
                name: '参加条件',
                value: condition,
            },
        ])
        .setImage(image)
        .setTimestamp()
        .setThumbnail(logo);

    if (exists(reserveChannel)) {
        embed.addFields({
            name: '使用チャンネル',
            value: '🔉 ' + reserveChannel.name,
        });
    }

    try {
        const embedMessage = await interaction.editReply({
            content: txt,
            embeds: [embed],
        });

        let recruitNum = Number(recruitNumText);
        if (isNaN(recruitNum)) {
            recruitNum = -1;
        }

        // DBに募集情報を登録
        await RecruitService.registerRecruit(
            guild.id,
            recruitChannel.id,
            embedMessage.id,
            recruiter.userId,
            recruitNum,
            condition,
            null,
            RecruitType.OtherGameRecruit,
        );

        // DBに参加者情報を登録
        await ParticipantService.registerParticipantFromMember(
            guild.id,
            embedMessage.id,
            recruiter,
            0,
        );

        const sentMessage = await recruitChannel.send({
            content: mention + ' ボタンを押して参加表明するでし',
        });

        if (!sentMessage.inGuild()) return;
        if (!embedMessage.inGuild()) return;

        // 募集文を削除してもボタンが動くように、bot投稿メッセージのメッセージIDでボタン作る
        const deleteButtonMsg = await recruitChannel.send({
            components: [embedRecruitDeleteButton(sentMessage, embedMessage)],
        });

        if (reserveChannel instanceof VoiceChannel && member.voice.channelId != reserveChannel.id) {
            await sentMessage.edit({
                components: [recruitActionRow(embedMessage, reserveChannel.id)],
            });
            await reserveChannel.permissionOverwrites.set(
                [
                    {
                        id: guild.roles.everyone.id,
                        deny: [PermissionsBitField.Flags.Connect],
                    },
                    {
                        id: recruiter.userId,
                        allow: [PermissionsBitField.Flags.Connect],
                    },
                ],
                'Reserve Voice Channel',
            );

            await interaction.followUp({
                content: '募集完了でし！参加者が来るまで待つでし！\n15秒間は募集を取り消せるでし！',
                components: [unlockChannelButton(reserveChannel.id)],
                ephemeral: true,
            });
        } else {
            await sentMessage.edit({ components: [recruitActionRow(embedMessage)] });
            await interaction.followUp({
                content: '募集完了でし！参加者が来るまで待つでし！\n15秒間は募集を取り消せるでし！',
                ephemeral: true,
            });
        }

        // 募集リスト更新
        if (recruitChannel.isTextBased()) {
            await sendRecruitSticky({ channelOpt: { guild: guild, channelId: recruitChannel.id } });
        }

        // 15秒後に削除ボタンを消す
        await sleep(15);
        const deleteButtonCheck = await searchMessageById(
            guild,
            recruitChannel.id,
            deleteButtonMsg.id,
        );
        if (exists(deleteButtonCheck)) {
            await deleteButtonCheck.delete();
        } else {
            if (
                reserveChannel instanceof VoiceChannel &&
                member.voice.channelId != reserveChannel.id
            ) {
                await reserveChannel.permissionOverwrites.delete(
                    guild.roles.everyone,
                    'UnLock Voice Channel',
                );
                await reserveChannel.permissionOverwrites.delete(
                    member.user,
                    'UnLock Voice Channel',
                );
            }
            return;
        }

        // 2時間後にVCロック解除
        await sleep(7200 - 15);
        if (reserveChannel instanceof VoiceChannel && member.voice.channelId != reserveChannel.id) {
            await reserveChannel.permissionOverwrites.delete(
                guild.roles.everyone,
                'UnLock Voice Channel',
            );
            await reserveChannel.permissionOverwrites.delete(member.user, 'UnLock Voice Channel');
        }
    } catch (error) {
        await sendErrorLogs(logger, error);
    }
}

async function sendErrorMessage(channel: TextBasedChannel) {
    await channel.send(
        '設定がおかしいでし！\n「お手数ですがサポートセンターまでご連絡お願いします。」でし！',
    );
}
