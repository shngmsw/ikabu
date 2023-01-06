const { createRegularModal } = require('./create_regular_modal');
const { createAnarchyModal } = require('./create_anarchy_modal');
const { createSalmonModal } = require('./create_salmon_modal');
const { createFesModal } = require('./create_fes_modal');

module.exports = {
    handleCreateModal: handleCreateModal,
};

async function handleCreateModal(interaction, params) {
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
