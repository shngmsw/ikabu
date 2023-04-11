import { buttonEnable } from '../feat-admin/button_enabler/enable_button';
import { commandNames } from '../../constant';
import { createRecruitEditor } from '../feat-recruit/interactions/context_menus/recruit_editor';
import { sendCommandLog } from '../logs/commands/command_log';
import { MessageContextMenuCommandInteraction } from 'discord.js';

export async function call(interaction: MessageContextMenuCommandInteraction) {
    if (interaction.commandName === commandNames.buttonEnabler) {
        await buttonEnable(interaction);
    } else if (interaction.commandName === commandNames.recuitEditor) {
        await createRecruitEditor(interaction);
    }
    await sendCommandLog(interaction); // DB使うものはawait付けないとcloseエラー出る
    return;
}
