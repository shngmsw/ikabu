import { URLSearchParams } from 'url';

import { CacheType, ModalSubmitInteraction } from 'discord.js';

import { MemberService } from '../../db/member_service';
import { exists } from '../common/others';
import { anarchyRecruit } from '../feat-recruit/interactions/anarchy_recruit';
import { eventRecruit } from '../feat-recruit/interactions/event_recruit';
import { festRecruit } from '../feat-recruit/interactions/fest_recruit';
import { recruitEdit } from '../feat-recruit/interactions/modals/recruit_edit';
import { regularRecruit } from '../feat-recruit/interactions/regular_recruit';
import { salmonRecruit } from '../feat-recruit/interactions/salmon_recruit';

export async function call(interaction: ModalSubmitInteraction<CacheType>) {
    if (interaction.inGuild()) {
        const params = new URLSearchParams(interaction.customId);
        if (exists(params.get('recm'))) {
            await MemberService.createDummyUser(interaction.guildId);

            switch (params.get('recm')) {
                case 'regrec':
                    await regularRecruit(interaction);
                    break;
                case 'everec':
                    await eventRecruit(interaction);
                    break;
                case 'anarec':
                    await anarchyRecruit(interaction);
                    break;
                case 'salrec':
                    await salmonRecruit(interaction);
                    break;
                case 'fesrec':
                    await festRecruit(interaction);
                    break;
                case 'recedit':
                    await recruitEdit(interaction, params);
            }
        }
    }
    return;
}
