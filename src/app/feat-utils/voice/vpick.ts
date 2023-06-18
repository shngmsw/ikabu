import { ChatInputCommandInteraction } from 'discord.js';

export async function handleVoicePick(interaction: ChatInputCommandInteraction<'cached' | 'raw'>) {
    // 'インタラクションに失敗'が出ないようにするため
    await interaction.deferReply();

    const { options } = interaction;
    // 発言したヒトが接続してるボイチャから数字分のヒトをランダム抽出
    // 数字なしの場合は１人をランダム抽出

    const kazu = Number(options.getInteger('ピックする人数'));
    let user = '';
    if (kazu) {
        user = interaction.member.voice.channel.members.random(kazu);
    } else {
        user = interaction.member.voice.channel.members.random(1);
    }
    await interaction.editReply({ content: `${user}` });
}
