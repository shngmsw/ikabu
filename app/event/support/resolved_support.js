const { PermissionsBitField } = require('discord.js');
const { isEmpty } = require('../../common');
const { setButtonDisable, recoveryThinkingButton } = require('../../common/button_components');
const { tagIdsEmbed } = require('./tag_ids_embed');
const log4js = require('log4js');

module.exports = {
    setResolvedTag: setResolvedTag,
};

const logger = log4js.getLogger('interaction');

async function setResolvedTag(interaction) {
    try {
        const thread = interaction.channel;
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageThreads)) {
            return await interaction.reply({ content: '権限がないでし！', ephemeral: true });
        }

        if (isEmpty(process.env.TAG_ID_SUPPORT_PROGRESS) || isEmpty(process.env.TAG_ID_SUPPORT_RESOLVED)) {
            return await interaction.reply({ embeds: [tagIdsEmbed(thread)] });
        }

        await interaction.update({ components: await setButtonDisable(interaction.message, interaction) });

        if (thread.archived) {
            await thread.setArchived(false); // スレッドがアーカイブされてるとタグ変更とロックが行えないため
        }

        let appliedTags = thread.appliedTags;
        var replace_index = appliedTags.indexOf(process.env.TAG_ID_SUPPORT_PROGRESS);
        appliedTags.splice(replace_index, 1, process.env.TAG_ID_SUPPORT_RESOLVED);
        await thread.setAppliedTags(appliedTags, '質問対応終了');
        await thread.setLocked(true);
        await thread.setArchived(true);

        await interaction.editReply({ components: await recoveryThinkingButton(interaction, 'クローズ済') });
    } catch (error) {
        logger.error(error);
    }
}
