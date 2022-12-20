const { deleteVariables } = require('./delete_variables');
const { setVariables } = require('./set_variables');
const { showVariables } = require('./show_variables');

module.exports = {
    variablesHandler: variablesHandler,
};

function variablesHandler(interaction) {
    switch (interaction.options.getSubcommand()) {
        case '表示':
            showVariables(interaction);
            break;
        case '登録更新':
            setVariables(interaction);
            break;
        case '削除':
            deleteVariables(interaction);
            break;
    }
}
