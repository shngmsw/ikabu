import { ChatInputCommandInteraction, CacheType } from 'discord.js';

import { Participant } from '../../../../db/model/participant';
import { RecruitType } from '../../../../db/model/recruit';
import { ParticipantService } from '../../../../db/participants_service';
import { RecruitService } from '../../../../db/recruit_service';
import { searchChannelById } from '../../../common/manager/channel_manager';
import { searchDBMemberById } from '../../../common/manager/member_manager';
import { assertExistCheck, exists, notExists } from '../../../common/others';
import { notifyActionRow } from '../../buttons/create_recruit_buttons';
import { sendRecruitSticky } from '../../sticky/recruit_sticky_messages';
import { getMemberMentions } from '../buttons/other_events';

export async function buttonRecruit(interaction: ChatInputCommandInteraction<CacheType>) {
    if (!interaction.inGuild()) return;

    assertExistCheck(interaction.guild, 'guild');
    assertExistCheck(interaction.channel, 'channel');

    const guild = await interaction.guild.fetch();
    const recruiter = await searchDBMemberById(guild, interaction.member.user.id);
    const recruitChannel = await searchChannelById(guild, interaction.channel.id);
    if (notExists(recruitChannel) || !recruitChannel.isTextBased()) return;
    const recruitNum = interaction.options.getInteger('募集人数') ?? -1;

    let rChannelName = recruitChannel.name;
    if (recruitChannel.isThread() && exists(recruitChannel.parent)) {
        rChannelName = recruitChannel.parent.name;
    }

    let recruitType;
    // チャンネル名から募集種別を判定
    if (rChannelName.includes('プラベ')) {
        recruitType = RecruitType.PrivateRecruit;
    } else if (rChannelName.includes('別ゲー')) {
        recruitType = RecruitType.OtherGameRecruit;
    } else {
        recruitType = RecruitType.OtherGameRecruit;
    }

    let mention = '';
    if (recruitType === RecruitType.PrivateRecruit) {
        mention = `<@&${process.env.ROLE_ID_RECRUIT_PRIVATE}>`;
    } else if (recruitType === RecruitType.OtherGameRecruit) {
        mention = `<@&${process.env.ROLE_ID_RECRUIT_OTHERGAMES}>`;
    }

    assertExistCheck(recruiter, 'recruiter');

    await interaction.deferReply({ ephemeral: true });

    const sentMessage = await recruitChannel.send({
        content: mention + ` ボタンを押して参加表明するでし！\n${getMemberMentions(recruitNum, [])}`,
    });
    // DBに募集情報を登録
    await RecruitService.registerRecruit(
        guild.id,
        recruitChannel.id,
        sentMessage.id,
        recruiter.userId,
        recruitNum,
        'dummy',
        null,
        recruitType,
    );

    // DBに参加者情報を登録
    await ParticipantService.registerParticipantFromObj(
        sentMessage.id,
        new Participant(recruiter.userId, recruiter.displayName, recruiter.iconUrl, 0, new Date()),
    );

    // 募集リスト更新
    if (recruitType === RecruitType.PrivateRecruit) {
        assertExistCheck(process.env.CHANNEL_ID_RECRUIT_PRIVATE, 'CHANNEL_ID_RECRUIT_PRIVATE');
        await sendRecruitSticky({ channelOpt: { guild: guild, channelId: process.env.CHANNEL_ID_RECRUIT_PRIVATE } });
    } else if (recruitType === RecruitType.OtherGameRecruit) {
        assertExistCheck(process.env.CHANNEL_ID_RECRUIT_OTHERGAMES, 'CHANNEL_ID_RECRUIT_OTHERGAMES');
        await sendRecruitSticky({ channelOpt: { guild: guild, channelId: process.env.CHANNEL_ID_RECRUIT_OTHERGAMES } });
    }

    await interaction.editReply({
        content: '募集完了でし！参加者が来るまで気長に待つでし！',
    });
    sentMessage.edit({ components: [notifyActionRow()] });
}