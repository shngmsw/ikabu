import {
    ChatInputCommandInteraction,
    CacheType,
    Guild,
    GuildMember,
    Collection,
    Role,
    ColorResolvable,
    EmbedBuilder,
    ChannelType,
    GuildTextBasedChannel,
} from 'discord.js';

import { ParticipantService } from '../../../../db/participant_service';
import { RecruitService, RecruitType } from '../../../../db/recruit_service';
import { UniqueRoleService } from '../../../../db/unique_role_service';
import { log4js_obj } from '../../../../log4js_settings';
import { searchDBMemberById } from '../../../common/manager/member_manager';
import { searchMessageById } from '../../../common/manager/message_manager';
import { assertExistCheck, exists, sleep } from '../../../common/others';
import { RoleKeySet } from '../../../constant/role_key';
import { sendErrorLogs } from '../../../logs/error/send_error_logs';
import { embedRecruitDeleteButton, recruitActionRow } from '../../buttons/create_recruit_buttons';
import { getVCReserveErrorMessage } from '../../common/condition_checks/vc_reserve_check';
import { createRecruitEvent } from '../../common/vc_reservation/recruit_event';
import { sendRecruitSticky } from '../../sticky/recruit_sticky_messages';

const logger = log4js_obj.getLogger('recruit');

export async function otherGameRecruit(interaction: ChatInputCommandInteraction<'cached'>) {
    assertExistCheck(interaction.channel, 'channel');

    await interaction.deferReply({ ephemeral: false });

    const guild = interaction.guild;
    const options = interaction.options;
    const member = interaction.member;
    assertExistCheck(member, 'member');

    const voiceChannel = options.getChannel('使用チャンネル', false, [
        ChannelType.GuildVoice,
        ChannelType.GuildStageVoice,
    ]);

    if (exists(voiceChannel)) {
        const voiceChannelReserveErrorMessage = await getVCReserveErrorMessage(
            guild.id,
            voiceChannel,
            member.id,
        );

        if (exists(voiceChannelReserveErrorMessage)) {
            await interaction.deleteReply();
            return await interaction.followUp(voiceChannelReserveErrorMessage);
        }
    }

    const roles = await guild.roles.fetch();
    const recruitChannel = interaction.channel;

    if (options.getSubcommand() === 'apex') {
        await apexLegends(interaction, guild, recruitChannel, member, roles);
    } else if (options.getSubcommand() === 'mhw') {
        await monsterHunterWilds(interaction, guild, recruitChannel, member, roles);
    } else if (options.getSubcommand() === 'overwatch') {
        await overwatch(interaction, guild, recruitChannel, member, roles);
    } else if (options.getSubcommand() === 'valo') {
        await valorant(interaction, guild, recruitChannel, member, roles);
    } else if (options.getSubcommand() === 'other') {
        await others(interaction, guild, recruitChannel, member);
    }
}

async function monsterHunterWilds(
    interaction: ChatInputCommandInteraction<CacheType>,
    guild: Guild,
    recruitChannel: GuildTextBasedChannel,
    member: GuildMember,
    roles: Collection<string, Role>,
) {
    const role = roles.find((role: Role) => role.name === 'ハンター');
    if (role === undefined) {
        await sendErrorMessage(recruitChannel);
        return;
    }
    const title = 'MONSTER HUNTER WILDS';
    const recruitNumText = interaction.options.getString('募集人数', true);
    const mention = role.toString();
    const txt = `### <@${member.user.id}>` + 'たんのモンハンワイルズ募集\n';
    const color = '#e39820';
    const image =
        'https://github.com/shngmsw/ikabu/blob/stg/images/games/MonsterHunterWilds.png?raw=true';
    const logo =
        'https://github.com/shngmsw/ikabu/blob/stg/images/games/MonsterHunterWilds_logo.png?raw=true';
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
    recruitChannel: GuildTextBasedChannel,
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
    recruitChannel: GuildTextBasedChannel,
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
    recruitChannel: GuildTextBasedChannel,
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
    recruitChannel: GuildTextBasedChannel,
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
    recruitChannel: GuildTextBasedChannel,
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

    const voiceChannel = options.getChannel('使用チャンネル', false, [
        ChannelType.GuildVoice,
        ChannelType.GuildStageVoice,
    ]);

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

    if (exists(voiceChannel)) {
        embed.addFields({
            name: '使用チャンネル',
            value: '🔉 ' + voiceChannel.name,
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

        // 募集イベントの作成
        let eventId: string | null = null;
        if (exists(voiceChannel)) {
            eventId = (
                await createRecruitEvent(
                    guild,
                    `${title} - ${recruiter.displayName}`,
                    recruiter.userId,
                    voiceChannel,
                    image,
                    new Date(),
                )
            ).id;
        }

        // DBに募集情報を登録
        await RecruitService.registerRecruit(
            guild.id,
            recruitChannel.id,
            embedMessage.id,
            recruiter.userId,
            recruitNum,
            condition,
            exists(voiceChannel) ? voiceChannel.name : null,
            eventId,
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

        await sentMessage.edit({
            components: [recruitActionRow(embedMessage)],
        });

        await interaction.followUp({
            content: '募集完了でし！参加者が来るまで待つでし！\n15秒間は募集を取り消せるでし！',
            ephemeral: true,
        });

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
            return;
        }
    } catch (error) {
        await sendErrorLogs(logger, error);
    }
}

async function sendErrorMessage(channel: GuildTextBasedChannel) {
    await channel.send(
        '設定がおかしいでし！\n「お手数ですがサポートセンターまでご連絡お願いします。」でし！',
    );
}
