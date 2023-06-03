import { MessageContextMenuCommandInteraction } from 'discord.js';

import { commandNames } from '../../constant';
import { buttonEnable } from '../feat-admin/button_enabler/enable_button';
import { createRecruitEditor } from '../feat-recruit/interactions/context_menus/recruit_editor';
import { sendCommandLog } from '../logs/commands/command_log';

export async function call(interaction: MessageContextMenuCommandInteraction) {
    await sendCommandLog(interaction); // DB使うものはawait付けないとcloseエラー出る

    if (interaction.commandName === commandNames.buttonEnabler) {
        await buttonEnable(interaction);
    } else if (interaction.commandName === commandNames.recuitEditor) {
        await createRecruitEditor(interaction);
    }
    return;
}
