import { CacheType, ChatInputCommandInteraction, CommandInteractionOptionResolver, EmbedBuilder } from 'discord.js';
import { log4js_obj } from '../../../../log4js_settings';
import { searchMemberById } from '../../../common/manager/member_manager';
import { searchMessageById } from '../../../common/manager/message_manager';
import { isNotEmpty, sleep } from '../../../common/others';
import { embedRecruitDeleteButton, notifyActionRow, recruitActionRow } from '../../buttons/create_recruit_buttons';

const logger = log4js_obj.getLogger('recruit');

export async function privateRecruit(interaction: ChatInputCommandInteraction) {
    if (!interaction.isCommand()) return;

    const options = interaction.options;

    if (options.getSubcommand() === 'recruit') {
        await interaction.deferReply();
        await sendPrivateRecruit(interaction, options);
    } else if (options.getSubcommand() === 'button') {
        await sendNotification(interaction);
    }
}

async function sendPrivateRecruit(
    interaction: ChatInputCommandInteraction,
    options: Omit<CommandInteractionOptionResolver<CacheType>, 'getMessage' | 'getFocused'>,
) {
    const start_time = interaction.options.getString('開始時刻') ?? 'ERROR';
    const time = interaction.options.getString('所要時間') ?? 'ERROR';
    const recruitNumText = options.getString('募集人数') ?? 'ERROR';
    const condition = options.getString('内容または参加条件') ?? 'なし';
    const logo = 'https://cdn.wikimg.net/en/splatoonwiki/images/1/1a/Private-battles-badge%402x.png';

    const guild = await interaction.guild?.fetch();
    if (guild === undefined) {
        throw new Error('guild cannot fetch.');
    }
    const recruit_channel = interaction.channel;
    if (recruit_channel === null) {
        throw new Error('recruit_channel is null.');
    }
    const host_member = await searchMemberById(guild, interaction.member?.user.id);
    if (host_member === null) {
        throw new Error('host_member is null.');
    }
    const authorName = host_member.displayName;
    const authorAvatarUrl = host_member.avatarURL();

    const embed = new EmbedBuilder()
        .setAuthor({
            name: authorName,
            iconURL: authorAvatarUrl,
        })
        .setTitle('プライベートマッチ募集')
        .addFields([
            {
                name: '開始時刻',
                value: start_time,
            },
            {
                name: '所要時間',
                value: time,
            },
            {
                name: '募集人数',
                value: recruitNumText,
            },
            {
                name: 'プラベ内容または参加条件',
                value: condition,
            },
        ])
        .setColor('#5900b7')
        .setTimestamp()
        .setThumbnail(logo);

    try {
        const header = await interaction.editReply({
            content: `<@${host_member.id}>**たんのプライベートマッチ募集**`,
            embeds: [embed],
        });

        const mention = `<@&${process.env.ROLE_ID_RECRUIT_PRIVATE}>`;
        const sentMessage = await recruit_channel.send({
            content: mention + ' ボタンを押して参加表明するでし！',
        });
        // 募集文を削除してもボタンが動くように、bot投稿メッセージのメッセージIDでボタン作る
        sentMessage.edit({ components: [recruitActionRow(header)] });
        const deleteButtonMsg = await recruit_channel.send({
            components: [embedRecruitDeleteButton(sentMessage, header)],
        });

        await interaction.followUp({
            content: '募集完了でし！参加者が来るまで気長に待つでし！\n15秒間は募集を取り消せるでし！',
            ephemeral: true,
        });

        // ピン留め
        header.pin();

        // 15秒後に削除ボタンを消す
        await sleep(15);
        const deleteButtonCheck = await searchMessageById(guild, recruit_channel.id, deleteButtonMsg.id);
        if (isNotEmpty(deleteButtonCheck)) {
            deleteButtonCheck.delete();
        } else {
            return;
        }
    } catch (error) {
        logger.error(error);
    }
}

async function sendNotification(interaction: ChatInputCommandInteraction) {
    const mention = `<@&${process.env.ROLE_ID_RECRUIT_PRIVATE}>`;
    const guild = await interaction.guild?.fetch();
    await interaction.deferReply({ ephemeral: true });
    if (guild === undefined) {
        throw new Error('guild cannot fetch.');
    }
    const recruit_channel = interaction.channel;
    if (recruit_channel === null) {
        throw new Error('recruit_channel is null.');
    }
    const host_member = await searchMemberById(interaction.guild, interaction.member?.user.id);
    if (host_member === null) {
        throw new Error('host_member is null.');
    }
    const sentMessage = await recruit_channel.send({
        content: mention + ' ボタンを押して参加表明するでし！',
    });
    // ピン留め
    sentMessage.pin();
    await interaction.editReply({
        content: '募集完了でし！参加者が来るまで気長に待つでし！',
    });
    // 募集文を削除してもボタンが動くように、bot投稿メッセージのメッセージIDでボタン作る
    sentMessage.edit({ components: [notifyActionRow(host_member.id)] });
}
