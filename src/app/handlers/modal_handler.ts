import { URLSearchParams } from 'url';
import { isNotEmpty } from '../common/others';
import {
    modalRegularRecruit,
    modalAnarchyRecruit,
    modalSalmonRecruit,
    modalFesRecruit,
} from '../feat-recruit/interactions/modals/extract_recruit_modal';
import { recruitEdit } from '../feat-recruit/interactions/modals/recruit_edit';

export async function call(interaction: $TSFixMe) {
    const params = new URLSearchParams(interaction.customId);
    if (isNotEmpty(params.get('recm'))) {
        switch (params.get('recm')) {
            case 'regrec':
                modalRegularRecruit(interaction);
                break;
            case 'anarec':
                modalAnarchyRecruit(interaction);
                break;
            case 'salrec':
                modalSalmonRecruit(interaction);
                break;
            case 'fesrec':
                modalFesRecruit(interaction, params);
                break;
            case 'recedit':
                recruitEdit(interaction, params);
        }
    }
    return;
}
