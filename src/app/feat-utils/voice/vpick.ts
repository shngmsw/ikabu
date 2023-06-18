import { ChatInputCommandInteraction, GuildMember } from 'discord.js';

import { getGuildByInteraction } from '../../common/manager/guild_manager';
import { searchAPIMemberById } from '../../common/manager/member_manager';
import { assertExistCheck, notExists } from '../../common/others';

export async function handleVoicePick(interaction: ChatInputCommandInteraction<'cached' | 'raw'>) {
    // 'インタラクションに失敗'が出ないようにするため
    await interaction.deferReply();

    const guild = await getGuildByInteraction(interaction);
    const member = await searchAPIMemberById(guild, interaction.member.user.id);
    assertExistCheck(member, 'member');

    const { options } = interaction;
    // 発言したヒトが接続してるボイチャから数字分のヒトをランダム抽出
    // 数字なしの場合は１人をランダム抽出

    if (notExists(member.voice.channel)) {
        return await interaction.editReply('ボイスチャンネルに接続してないでし！');
    }

    const kazu = Number(options.getInteger('ピックする人数'));
    let user: GuildMember[] = [];
    if (kazu) {
        user = member.voice.channel.members.random(kazu);
    } else {
        user = member.voice.channel.members.random(1);
    }
    await interaction.editReply({ content: `${user}` });
}
