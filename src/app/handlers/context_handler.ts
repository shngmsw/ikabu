import { buttonEnable } from '../feat-admin/button_enabler/enable_button';
import { commandNames } from '../../constant';
import { createRecruitEditor } from '../feat-recruit/interactions/context_menus/recruit_editor';

export async function call(interaction: $TSFixMe) {
    if (interaction.commandName === commandNames.buttonEnabler) {
        buttonEnable(interaction);
    } else if (interaction.commandName === commandNames.recuitEditor) {
        createRecruitEditor(interaction);
    }
    return;
}
