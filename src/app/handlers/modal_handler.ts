import { URLSearchParams } from 'url';
import { isNotEmpty } from '../common/others';
import {
    modalRegularRecruit,
    modalAnarchyRecruit,
    modalSalmonRecruit,
    modalFesRecruit,
} from '../feat-recruit/interactions/modals/extract_recruit_modal';

export async function call(interaction: $TSFixMe) {
    const params = new URLSearchParams(interaction.customId);
    if (isNotEmpty(params.get('recm'))) {
        const recruitModals = {
            regrec: modalRegularRecruit,
            anarec: modalAnarchyRecruit,
            salrec: modalSalmonRecruit,
            fesrec: modalFesRecruit,
        };
        // @ts-expect-error TS(2538): Type 'null' cannot be used as an index type.
        await recruitModals[params.get('recm')](interaction, params);
    }
    return;
}
