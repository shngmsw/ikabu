import {
    AttachmentBuilder,
    ChannelType,
    ChatInputCommandInteraction,
    GuildMember,
    PermissionsBitField,
    User,
    VoiceChannel,
} from 'discord.js';
import { RecruitService } from '../../../../db/recruit_service';
import { log4js_obj } from '../../../../log4js_settings';
import { checkFes, fetchSchedule, getAnarchyOpenData } from '../../../common/apis/splatoon3_ink';
import { setButtonDisable } from '../../../common/button_components';
import { searchChannelIdByName } from '../../../common/manager/channel_manager';
import { searchMemberById } from '../../../common/manager/member_manager';
import { searchMessageById } from '../../../common/manager/message_manager';
import { searchRoleIdByName } from '../../../common/manager/role_manager';
import { isEmpty, isNotEmpty, sleep } from '../../../common/others';
import { recruitActionRow, recruitDeleteButton, unlockChannelButton } from '../../buttons/create_recruit_buttons';
import { recruitAnarchyCanvas, ruleAnarchyCanvas } from '../../canvases/anarchy_canvas';
import { getMemberMentions } from '../buttons/recruit_button_events';

const logger = log4js_obj.getLogger('recruit');

export async function anarchyRecruit(interaction: ChatInputCommandInteraction) {
    if (!interaction.isCommand()) return;

    const options = interaction.options;
    const channel = interaction.channel;
    const voice_channel = interaction.options.getChannel('使用チャンネル');
    let rank = options.getString('募集ウデマエ');
    const recruit_num = options.getInteger('募集人数') ?? -1;
    let condition = options.getString('参加条件');
    const guild = await interaction.guild?.fetch();
    const host_member = await searchMemberById(guild, interaction.member?.user.id);
    const user1 = options.getUser('参加者1');
    const user2 = options.getUser('参加者2');
    let member_counter = recruit_num; // プレイ人数のカウンター
    let type;

    if (options.getSubcommand() === 'now') {
        type = 0;
    } else if (options.getSubcommand() === 'next') {
        type = 1;
    }

    if (isEmpty(recruit_num)) {
        return;
    }

    if (recruit_num < 1 || recruit_num > 3) {
        await interaction.reply({
            content: '募集人数は1～3までで指定するでし！',
            ephemeral: true,
        });
        return;
    } else {
        member_counter++;
    }

    // プレイヤー指定があればカウンターを増やす
    if (user1 !== null) member_counter++;
    if (user2 !== null) member_counter++;

    if (member_counter > 4) {
        await interaction.reply({
            content: '募集人数がおかしいでし！',
            ephemeral: true,
        });
        return;
    }

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
        if (voice_channel.members.size != 0 && !voice_channel.members.has(host_member.user.id)) {
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

    // 'インタラクションに失敗'が出ないようにするため
    await interaction.deferReply();

    let mention = `<@&${process.env.ROLE_ID_RECRUIT_ANARCHY}>`;
    // 募集条件がランクの場合はウデマエロールにメンション
    if (rank !== undefined && rank !== null) {
        const mention_id = await searchRoleIdByName(guild, rank);
        if (mention_id == null) {
            await interaction.editReply({
                content: '設定がおかしいでし！\n「お手数ですがサポートセンターまでご連絡お願いします。」でし！',
            });
            return;
        }
        mention = `<@&${mention_id}>`;
    } else {
        rank = '指定なし';
    }
    try {
        const data = await fetchSchedule();

        if (checkFes(data.schedule, type)) {
            const fes_channel_id = await searchChannelIdByName(guild, 'フェス募集', ChannelType.GuildText, null);
            await interaction.editReply({
                content: `募集を建てようとした期間はフェス中でし！\nフェス募集をするには<#${fes_channel_id}>のチャンネルを使うでし！`,
            });
            return;
        }

        const anarchy_data = await getAnarchyOpenData(data, type);

        let txt = `<@${host_member.user.id}>` + '**たんのバンカラ募集**\n';
        if (user1 !== null && user2 !== null) {
            txt = txt + `<@${user1.id}>` + 'たんと' + `<@${user2.id}>` + 'たんの参加が既に決定しているでし！';
        } else if (user1 !== null) {
            txt = txt + `<@${user1.id}>` + 'たんの参加が既に決定しているでし！';
        } else if (user2 !== null) {
            txt = txt + `<@${user2.id}>` + 'たんの参加が既に決定しているでし！';
        }

        if (condition == null) condition = 'なし';

        await sendAnarchyMatch(
            interaction,
            mention,
            txt,
            recruit_num,
            condition,
            member_counter,
            rank,
            host_member,
            user1,
            user2,
            anarchy_data,
        );
    } catch (error) {
        if (channel !== null) {
            channel.send('なんかエラーでてるわ');
        }
        logger.error(error);
    }
}

async function sendAnarchyMatch(
    interaction: ChatInputCommandInteraction,
    mention: string,
    txt: string,
    recruit_num: number,
    condition: string,
    count: number,
    rank: string,
    host_member: GuildMember,
    user1: User | null,
    user2: User | null,
    anarchy_data: $TSFixMe,
) {
    let thumbnail_url; // ガチルールのアイコン
    let thumbnailXP; // アイコンx座標
    let thumbnailYP; // アイコンy座標
    let thumbScaleX; // アイコン幅
    let thumbScaleY; // アイコン高さ
    switch (anarchy_data.rule) {
        case 'ガチエリア':
            thumbnail_url = 'https://cdn.glitch.com/4ea6ca87-8ea7-482c-ab74-7aee445ea445%2Fobject_area.png';
            thumbnailXP = 600;
            thumbnailYP = 20;
            thumbScaleX = 90;
            thumbScaleY = 100;
            break;
        case 'ガチヤグラ':
            thumbnail_url = 'https://cdn.glitch.com/4ea6ca87-8ea7-482c-ab74-7aee445ea445%2Fobject_yagura.png';
            thumbnailXP = 595;
            thumbnailYP = 20;
            thumbScaleX = 90;
            thumbScaleY = 100;
            break;
        case 'ガチホコバトル':
            thumbnail_url = 'https://cdn.glitch.com/4ea6ca87-8ea7-482c-ab74-7aee445ea445%2Fobject_hoko.png';
            thumbnailXP = 585;
            thumbnailYP = 23;
            thumbScaleX = 110;
            thumbScaleY = 90;
            break;
        case 'ガチアサリ':
            thumbnail_url = 'https://cdn.glitch.com/4ea6ca87-8ea7-482c-ab74-7aee445ea445%2Fobject_asari.png';
            thumbnailXP = 570;
            thumbnailYP = 20;
            thumbScaleX = 120;
            thumbScaleY = 100;
            break;
        default:
            thumbnail_url =
                'http://placehold.jp/15/4c4d57/ffffff/100x100.png?text=ここに画像を貼りたかったんだが、どうやらエラーみたいだ…。';
            thumbnailXP = 595;
            thumbnailYP = 20;
            thumbScaleX = 100;
            thumbScaleY = 100;
            break;
    }

    const guild = await interaction.guild?.fetch();
    if (guild === undefined) {
        throw new Error('guild cannot fetch');
    }
    const reserve_channel = interaction.options.getChannel('使用チャンネル');

    let channel_name = '🔉 VC指定なし';
    if (reserve_channel instanceof VoiceChannel) {
        channel_name = '🔉 ' + reserve_channel.name;
    }

    const thumbnail = [thumbnail_url, thumbnailXP, thumbnailYP, thumbScaleX, thumbScaleY];

    // サーバーメンバーとして取得し直し
    if (user1 !== null) {
        user1 = await searchMemberById(guild, user1.id);
    }
    if (user2 !== null) {
        user2 = await searchMemberById(guild, user2.id);
    }

    const recruitBuffer = await recruitAnarchyCanvas(recruit_num, count, host_member, user1, user2, condition, rank, channel_name);
    const recruit = new AttachmentBuilder(recruitBuffer, {
        name: 'ikabu_recruit.png',
    });

    const rule = new AttachmentBuilder(await ruleAnarchyCanvas(anarchy_data, thumbnail), { name: 'rules.png' });

    try {
        const recruit_channel = interaction.channel;

        if (recruit_channel === null) {
            throw new Error('recruit_channel is null.');
        }
        const image1_message = await interaction.editReply({
            content: txt,
            files: [recruit],
        });
        const image2_message = await recruit_channel.send({ files: [rule] });
        const sentMessage = await recruit_channel.send({
            content: mention + ' ボタンを押して参加表明するでし！',
        });

        // 募集文を削除してもボタンが動くように、bot投稿メッセージのメッセージIDでボタン作る
        const deleteButtonMsg = await recruit_channel.send({
            components: [recruitDeleteButton(sentMessage, image1_message, image2_message)],
        });

        if (reserve_channel instanceof VoiceChannel && host_member.voice.channelId != reserve_channel.id) {
            sentMessage.edit({
                components: [recruitActionRow(image1_message, reserve_channel?.id)],
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
            sentMessage.edit({ components: [recruitActionRow(image1_message)] });
            await interaction.followUp({
                content: '募集完了でし！参加者が来るまで待つでし！\n15秒間は募集を取り消せるでし！',
                ephemeral: true,
            });
        }

        // ピン留め
        image1_message.pin();

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

        // 2時間後にボタンを無効化する
        await sleep(7200 - 15);
        const checkMessage = await searchMessageById(guild, recruit_channel.id, sentMessage.id);

        if (isEmpty(checkMessage)) {
            return;
        }
        const message_first_row = checkMessage.content.split('\n')[0];
        if (message_first_row.indexOf('〆') !== -1 || message_first_row.indexOf('キャンセル') !== -1) {
            return;
        }

        const recruit_data = await RecruitService.getRecruitAllByMessageId(checkMessage.id);
        const member_list = getMemberMentions(recruit_data);
        const host_mention = `<@${host_member.user.id}>`;

        checkMessage.edit({
            content: '`[自動〆]`\n' + `${host_mention}たんの募集は〆！\n${member_list}`,
            components: await setButtonDisable(checkMessage),
        });
        // ピン留め解除
        image1_message.unpin();
        if (reserve_channel instanceof VoiceChannel && host_member.voice.channelId != reserve_channel.id) {
            reserve_channel.permissionOverwrites.delete(guild.roles.everyone, 'UnLock Voice Channel');
            reserve_channel.permissionOverwrites.delete(host_member.user, 'UnLock Voice Channel');
        }
    } catch (error) {
        logger.error(error);
    }
}
