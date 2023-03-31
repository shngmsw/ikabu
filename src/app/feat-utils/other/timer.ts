import { isInteger } from '../../common/others';

export async function handleTimer(interaction: $TSFixMe) {
    if (!interaction.isCommand()) return;
    // 'インタラクションに失敗'が出ないようにするため
    await interaction.deferReply();

    const { options } = interaction;
    const kazu = options.getInteger('分');
    let count = kazu;
    if (count <= 10 && count > 0 && isInteger(kazu)) {
        await interaction.editReply('タイマーを' + count + '分後にセットしたでし！');
        const countdown = async function () {
            count--;
            if (count != 0) {
                await interaction.editReply(`残り${count}分でし`);
            } else {
                await interaction.followUp(`<@${interaction.member.user.id}> 時間でし！`);
            }
        };
        const id = setInterval(async function () {
            await countdown();
            if (count <= 0) {
                clearInterval(id);
            }
        }, 60000);
    } else {
        await interaction.editReply('10分以内しか入力できないでし！');
    }
}
