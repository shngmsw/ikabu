import { buttonEnable } from '../feat-admin/button_enabler/enable_button';
import { commandNames } from '../../constant';

export async function call(interaction: $TSFixMe) {
    if (interaction.commandName == commandNames.buttonEnabler) {
        buttonEnable(interaction);
    }
    return;
}
