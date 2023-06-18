import { URLSearchParams } from 'url';

import { CacheType, ModalSubmitInteraction } from 'discord.js';

import { MemberService } from '../../db/member_service';
import { exists } from '../common/others';
import {
    modalAnarchyRecruit,
    modalEventRecruit,
    modalFesRecruit,
    modalRegularRecruit,
    modalSalmonRecruit,
} from '../feat-recruit/interactions/modals/extract_recruit_modal';
import { recruitEdit } from '../feat-recruit/interactions/modals/recruit_edit';

export async function call(interaction: ModalSubmitInteraction<CacheType>) {
    if (interaction.inGuild()) {
        const params = new URLSearchParams(interaction.customId);
        if (exists(params.get('recm'))) {
            await MemberService.createDummyUser(interaction.guildId);

            switch (params.get('recm')) {
                case 'regrec':
                    await modalRegularRecruit(interaction);
                    break;
                case 'everec':
                    await modalEventRecruit(interaction);
                    break;
                case 'anarec':
                    await modalAnarchyRecruit(interaction);
                    break;
                case 'salrec':
                    await modalSalmonRecruit(interaction);
                    break;
                case 'fesrec':
                    await modalFesRecruit(interaction, params);
                    break;
                case 'recedit':
                    await recruitEdit(interaction, params);
            }
        }
    }
    return;
}
