// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'createRegu... Remove this comment to see the full error message
const { createRegularModal } = require('./create_regular_modal');
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'createAnar... Remove this comment to see the full error message
const { createAnarchyModal } = require('./create_anarchy_modal');
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'createSalm... Remove this comment to see the full error message
const { createSalmonModal } = require('./create_salmon_modal');
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'createFesM... Remove this comment to see the full error message
const { createFesModal } = require('./create_fes_modal');

// @ts-expect-error TS(2552): Cannot find name 'module'. Did you mean 'mode'?
module.exports = {
    handleCreateModal: handleCreateModal,
};

// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'handleCrea... Remove this comment to see the full error message
async function handleCreateModal(interaction: $TSFixMe, params: $TSFixMe) {
    const channelName = params.get('cn');
    switch (channelName) {
        case 'リグマ募集':
        case 'リグマ募集2':
        case '🔰リグマ募集':
            // リグマ実装時に作る
            break;
        case 'ナワバリ募集':
            await createRegularModal(interaction);
            break;
        case 'バンカラ募集':
            await createAnarchyModal(interaction);
            break;
        case 'フウカ募集':
        case 'ウツホ募集':
        case 'マンタロー募集':
            await createFesModal(interaction, channelName);
            break;
        case 'サーモン募集':
            await createSalmonModal(interaction);
            break;

        default:
            break;
    }
}
