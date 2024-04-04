import { CacheType, ChatInputCommandInteraction } from 'discord.js';

import { notExists } from '../../common/others';

export async function handleTimer(interaction: ChatInputCommandInteraction<CacheType>) {
    const { options } = interaction;
    let count = options.getInteger('分');

    if (notExists(count)) {
        return await interaction.reply(ErrorTexts.UndefinedError);
    }

    if (count > 10 || count <= 0) {
        return await interaction.reply({
            content: '10分以内しか入力できないでし！',
            ephemeral: true,
        });
    }

    await interaction.reply('タイマーを`' + count + '分後`にセットしたでし！');

    const countdown = async function () {
        if (notExists(count)) {
            return await interaction.followUp(ErrorTexts.UndefinedError);
        }
        count--;
        await interaction.editReply(`残り\`${count}分\`でし`);
        if (count === 0) {
            if (interaction.inGuild()) {
                await interaction.followUp(`<@${interaction.member.user.id}> 時間でし！`);
            } else {
                await interaction.followUp(`<@${interaction.user.id}> 時間でし！`);
            }
        }
    };
    const id = setInterval(async function () {
        await countdown();
        if (notExists(count)) {
            return await interaction.followUp(ErrorTexts.UndefinedError);
        }
        if (count <= 0) {
            clearInterval(id);
        }
    }, 60000);
}
