import { ButtonInteraction } from 'discord.js';

import { cancel } from './cancel_event';
import { cancelNotify } from './cancel_notify_event';
import { close } from './close_event';
import { closeNotify } from './close_notify_event';
import { confirmJoinRequest } from './confirm_join_request';
import { del } from './delete_event';
import { join } from './join_event';
import { joinNotify } from './join_notify_event';
import { unlock } from './other_events';
import { RecruitParam } from '../../../constant/button_id';
import { handleCreateModal } from '../../modals/create_recruit_modals';

export async function recruitButtonHandler(
    interaction: ButtonInteraction<'cached' | 'raw'>,
    recruitParam: RecruitParam,
    params: URLSearchParams,
) {
    switch (recruitParam) {
        case RecruitParam.Join:
            await join(interaction, params);
            break;
        case RecruitParam.Cancel:
            await cancel(interaction, params);
            break;
        case RecruitParam.Delete:
            await del(interaction, params);
            break;
        case RecruitParam.Close:
            await close(interaction, params);
            break;
        case RecruitParam.Unlock:
            await unlock(interaction, params);
            break;
        case RecruitParam.JoinNotify:
            await joinNotify(interaction);
            break;
        case RecruitParam.CancelNotify:
            await cancelNotify(interaction);
            break;
        case RecruitParam.CloseNotify:
            await closeNotify(interaction);
            break;
        case RecruitParam.NewModalRecruit:
            await handleCreateModal(interaction, params);
            break;
        case RecruitParam.Approve:
        case RecruitParam.Reject:
            await confirmJoinRequest(interaction, params);
            break;
        default:
            break;
    }
}
