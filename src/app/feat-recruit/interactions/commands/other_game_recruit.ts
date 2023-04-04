import {
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
import { log4js_obj } from '../../../../log4js_settings';
import { searchMemberById } from '../../../common/manager/member_manager';
import { searchMessageById } from '../../../common/manager/message_manager';
import { isNotEmpty, sleep } from '../../../common/others';
import { embedRecruitDeleteButton, recruitActionRow, unlockChannelButton } from '../../buttons/create_recruit_buttons';

const logger = log4js_obj.getLogger('recruit');

export async function otherGameRecruit(interaction: ChatInputCommandInteraction) {
    // subCommands取得
    if (!interaction.isCommand()) return;

    const guild = await interaction.guild?.fetch();
    if (guild === undefined) {
        throw new Error('guild cannot fetch.');
    }
    const options = interaction.options;
    const host_member = await searchMemberById(guild, interaction.member?.user.id);
    if (host_member === null) {
        throw new Error('host_member is null.');
    }
    const voice_channel = interaction.options.getChannel('使用チャンネル');
    const usable_channel = [
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

    if (voice_channel instanceof VoiceChannel) {
        if (voice_channel.members.size != 0 && !voice_channel.members.has(host_member.id)) {
            await interaction.reply({
                content: 'そのチャンネルは使用中でし！',
                ephemeral: true,
            });
            return;
        } else if (!usable_channel.includes(voice_channel.name)) {
            await interaction.reply({
                content: 'そのチャンネルは指定できないでし！\n🔉alfa ～ 🔉mikeの間のチャンネルで指定するでし！',
                ephemeral: true,
            });
            return;
        }
    }

    // 募集がfollowUpでないとリグマと同じfunctionでeditできないため
    await interaction.deferReply();
    const roles = await guild.roles.fetch();
    const recruit_channel = interaction.channel;
    if (recruit_channel === null) {
        throw new Error('recruit_channel is null');
    }

    if (options.getSubcommand() === 'apex') {
        apexLegends(interaction, guild, recruit_channel, host_member, roles);
    } else if (options.getSubcommand() === 'mhr') {
        monsterHunterRise(interaction, guild, recruit_channel, host_member, roles);
    } else if (options.getSubcommand() === 'overwatch') {
        overwatch(interaction, guild, recruit_channel, host_member, roles);
    } else if (options.getSubcommand() === 'valo') {
        valorant(interaction, guild, recruit_channel, host_member, roles);
    } else if (options.getSubcommand() === 'other') {
        others(interaction, guild, recruit_channel, host_member);
    }
}

function monsterHunterRise(
    interaction: ChatInputCommandInteraction,
    guild: Guild,
    recruit_channel: TextBasedChannel,
    host_member: GuildMember,
    roles: Collection<string, Role>,
) {
    const role = roles.find((role: Role) => role.name === 'ハンター');
    if (role === undefined) {
        sendErrorMessage(recruit_channel);
        return;
    }
    const title = 'MONSTER HUNTER RISE';
    const recruitNumText = interaction.options.getString('募集人数') ?? 'ERROR';
    const mention = role.toString();
    const txt = `<@${host_member.id}>` + '**たんのモンハンライズ募集**\n';
    const color = '#b71008';
    const image = 'https://raw.githubusercontent.com/shngmsw/ikabu/stg/images/games/MonsterHunterRiseSunBreak.jpg';
    const logo = 'https://raw.githubusercontent.com/shngmsw/ikabu/stg/images/games/MonsterHunterRiseSunBreak_logo.png';
    sendOtherGames(interaction, guild, recruit_channel, host_member, title, recruitNumText, mention, txt, color, image, logo);
}

function apexLegends(
    interaction: ChatInputCommandInteraction,
    guild: Guild,
    recruit_channel: TextBasedChannel,
    host_member: GuildMember,
    roles: Collection<string, Role>,
) {
    const role = roles.find((role: Role) => role.name === 'レジェンド');
    if (role === undefined) {
        sendErrorMessage(recruit_channel);
        return;
    }
    const title = 'Apex Legends';
    const recruitNumText = interaction.options.getString('募集人数') ?? 'ERROR';
    const mention = role.toString();
    const txt = `<@${host_member.id}>` + '**たんのApexLegends募集**\n';
    const color = '#F30100';
    const image = 'https://raw.githubusercontent.com/shngmsw/ikabu/stg/images/games/ApexLegends.jpg';
    const logo = 'https://raw.githubusercontent.com/shngmsw/ikabu/stg/images/games/ApexLegends_logo.png';
    sendOtherGames(interaction, guild, recruit_channel, host_member, title, recruitNumText, mention, txt, color, image, logo);
}

function overwatch(
    interaction: ChatInputCommandInteraction,
    guild: Guild,
    recruit_channel: TextBasedChannel,
    host_member: GuildMember,
    roles: Collection<string, Role>,
) {
    const role = roles.find((role: Role) => role.name === 'ヒーロー');
    if (role === undefined) {
        sendErrorMessage(recruit_channel);
        return;
    }
    const title = 'Overwatch2';
    const recruitNumText = interaction.options.getString('募集人数') ?? 'ERROR';
    const mention = role.toString();
    const txt = `<@${host_member.id}>` + '**たんのOverwatch2募集**\n';
    const color = '#ED6516';
    const image = 'https://raw.githubusercontent.com/shngmsw/ikabu/stg/images/games/Overwatch2.png';
    const logo = 'https://raw.githubusercontent.com/shngmsw/ikabu/stg/images/games/Overwatch_logo.png';
    sendOtherGames(interaction, guild, recruit_channel, host_member, title, recruitNumText, mention, txt, color, image, logo);
}

function valorant(
    interaction: ChatInputCommandInteraction,
    guild: Guild,
    recruit_channel: TextBasedChannel,
    host_member: GuildMember,
    roles: Collection<string, Role>,
) {
    const role = roles.find((role: Role) => role.name === 'エージェント');
    if (role === undefined) {
        sendErrorMessage(recruit_channel);
        return;
    }
    const title = 'VALORANT';
    const recruitNumText = interaction.options.getString('募集人数') ?? 'ERROR';
    const mention = role.toString();
    const txt = `<@${host_member.id}>` + '**たんのVALORANT募集**\n';
    const color = '#FF4654';
    const image = 'https://raw.githubusercontent.com/shngmsw/ikabu/stg/images/games/valorant.jpg';
    const logo = 'https://raw.githubusercontent.com/shngmsw/ikabu/stg/images/games/valorant_logo.png';
    sendOtherGames(interaction, guild, recruit_channel, host_member, title, recruitNumText, mention, txt, color, image, logo);
}

function others(interaction: ChatInputCommandInteraction, guild: Guild, recruit_channel: TextBasedChannel, host_member: GuildMember) {
    const role_id = process.env.ROLE_ID_RECRUIT_OTHERGAMES;
    if (role_id === undefined) {
        sendErrorMessage(recruit_channel);
        return;
    }
    const title = interaction.options.getString('ゲームタイトル') ?? 'ERROR';
    const recruitNumText = interaction.options.getString('募集人数') ?? 'ERROR';
    const mention = `<@&${role_id}>`;
    const txt = `<@${host_member.id}>` + `**たんの${title}募集**\n`;
    const color = '#379C30';
    const image = 'https://raw.githubusercontent.com/shngmsw/ikabu/stg/images/games/others.jpg';
    const logo = 'https://raw.githubusercontent.com/shngmsw/ikabu/stg/images/games/others_logo.png';
    sendOtherGames(interaction, guild, recruit_channel, host_member, title, recruitNumText, mention, txt, color, image, logo);
}

async function sendOtherGames(
    interaction: ChatInputCommandInteraction,
    guild: Guild,
    recruit_channel: TextBasedChannel,
    host_member: GuildMember,
    title: string,
    recruitNumText: string,
    mention: string,
    txt: string,
    color: ColorResolvable,
    image: string,
    logo: string,
) {
    const options = interaction.options;

    const condition = options.getString('内容または参加条件');

    const reserve_channel = interaction.options.getChannel('使用チャンネル');

    const embed = new EmbedBuilder()
        .setAuthor({
            name: host_member.displayName,
            iconURL: host_member.displayAvatarURL(),
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
                value: condition == null ? 'なし' : condition,
            },
        ])
        .setImage(image)
        .setTimestamp()
        .setThumbnail(logo);

    if (reserve_channel != null) {
        embed.addFields({
            name: '使用チャンネル',
            value: '🔉 ' + reserve_channel.name,
        });
    }

    try {
        const header = await interaction.editReply({
            content: txt,
            embeds: [embed],
        });
        const sentMessage = await recruit_channel.send({
            content: mention + ' ボタンを押して参加表明するでし',
        });

        // 募集文を削除してもボタンが動くように、bot投稿メッセージのメッセージIDでボタン作る
        const deleteButtonMsg = await recruit_channel.send({
            components: [embedRecruitDeleteButton(sentMessage, header)],
        });

        if (reserve_channel instanceof VoiceChannel && host_member.voice.channelId != reserve_channel.id) {
            sentMessage.edit({
                components: [recruitActionRow(header, reserve_channel.id)],
            });
            reserve_channel.permissionOverwrites.set(
                [
                    {
                        id: guild.roles.everyone.id,
                        deny: [PermissionsBitField.Flags.Connect],
                    },
                    {
                        id: host_member.user.id,
                        allow: [PermissionsBitField.Flags.Connect],
                    },
                ],
                'Reserve Voice Channel',
            );

            await interaction.followUp({
                content: '募集完了でし！参加者が来るまで待つでし！\n15秒間は募集を取り消せるでし！',
                components: [unlockChannelButton(reserve_channel.id)],
                ephemeral: true,
            });
        } else {
            sentMessage.edit({ components: [recruitActionRow(header)] });
            await interaction.followUp({
                content: '募集完了でし！参加者が来るまで待つでし！\n15秒間は募集を取り消せるでし！',
                ephemeral: true,
            });
        }

        // ピン留め
        header.pin();

        // 15秒後に削除ボタンを消す
        await sleep(15);
        const deleteButtonCheck = await searchMessageById(guild, recruit_channel.id, deleteButtonMsg.id);
        if (isNotEmpty(deleteButtonCheck)) {
            deleteButtonCheck.delete();
        } else {
            if (reserve_channel instanceof VoiceChannel && host_member.voice.channelId != reserve_channel.id) {
                reserve_channel.permissionOverwrites.delete(guild.roles.everyone, 'UnLock Voice Channel');
                reserve_channel.permissionOverwrites.delete(host_member.user, 'UnLock Voice Channel');
            }
            return;
        }

        // 2時間後にVCロック解除
        await sleep(7200 - 15);
        if (reserve_channel instanceof VoiceChannel && host_member.voice.channelId != reserve_channel.id) {
            reserve_channel.permissionOverwrites.delete(guild.roles.everyone, 'UnLock Voice Channel');
            reserve_channel.permissionOverwrites.delete(host_member.user, 'UnLock Voice Channel');
        }
    } catch (error) {
        logger.error(error);
    }
}

async function sendErrorMessage(channel: TextBasedChannel) {
    await channel.send('設定がおかしいでし！\n「お手数ですがサポートセンターまでご連絡お願いします。」でし！');
}
