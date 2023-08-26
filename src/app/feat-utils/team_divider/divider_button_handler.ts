import { ButtonInteraction } from 'discord.js';

import {
    joinButton,
    registerButton,
    cancelButton,
    alfaButton,
    bravoButton,
    spectateButton,
    endButton,
    correctButton,
    hideButton,
} from './divider';
import { TeamDividerParam } from '../../constant/button_id';

export async function dividerButtonHandler(
    interaction: ButtonInteraction<'cached' | 'raw'>,
    param_t: TeamDividerParam,
    params: URLSearchParams,
) {
    switch (param_t) {
        case TeamDividerParam.Join:
            await joinButton(interaction, params);
            break;
        case TeamDividerParam.Register:
            await registerButton(interaction, params);
            break;
        case TeamDividerParam.Cancel:
            await cancelButton(interaction, params);
            break;
        case TeamDividerParam.Alfa:
            await alfaButton(interaction, params);
            break;
        case TeamDividerParam.Bravo:
            await bravoButton(interaction, params);
            break;
        case TeamDividerParam.Spectate:
            await spectateButton(interaction, params);
            break;
        case TeamDividerParam.End:
            await endButton(interaction, params);
            break;
        case TeamDividerParam.Correct:
            await correctButton(interaction, params);
            break;
        case TeamDividerParam.Hide:
            await hideButton(interaction, params);
            break;
        default:
            break;
    }
}
