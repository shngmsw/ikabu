// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'Permission... Remove this comment to see the full error message
const { PermissionsBitField } = require('discord.js');
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'isEmpty'.
const { isEmpty } = require('../../common/others');
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'setButtonD... Remove this comment to see the full error message
const { setButtonDisable, recoveryThinkingButton } = require('../../common/button_components');
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'tagIdsEmbe... Remove this comment to see the full error message
const { tagIdsEmbed } = require('./tag_ids_embed');
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'log4js'.
const log4js = require('log4js');

// @ts-expect-error TS(2552): Cannot find name 'module'. Did you mean 'mode'?
module.exports = {
    setResolvedTag: setResolvedTag,
};

// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'logger'.
const logger = log4js.getLogger('interaction');

// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'setResolve... Remove this comment to see the full error message
async function setResolvedTag(interaction: $TSFixMe) {
    try {
        const thread = interaction.channel;
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageThreads)) {
            return await interaction.reply({ content: '権限がないでし！', ephemeral: true });
        }

        // @ts-expect-error TS(2580): Cannot find name 'process'. Do you need to install... Remove this comment to see the full error message
        if (isEmpty(process.env.TAG_ID_SUPPORT_PROGRESS) || isEmpty(process.env.TAG_ID_SUPPORT_RESOLVED)) {
            return await interaction.reply({ embeds: [tagIdsEmbed(thread)] });
        }

        await interaction.update({ components: await setButtonDisable(interaction.message, interaction) });

        if (thread.archived) {
            await thread.setArchived(false); // スレッドがアーカイブされてるとタグ変更とロックが行えないため
        }

        let appliedTags = thread.appliedTags;
        // @ts-expect-error TS(2580): Cannot find name 'process'. Do you need to install... Remove this comment to see the full error message
        var replace_index = appliedTags.indexOf(process.env.TAG_ID_SUPPORT_PROGRESS);
        // @ts-expect-error TS(2580): Cannot find name 'process'. Do you need to install... Remove this comment to see the full error message
        appliedTags.splice(replace_index, 1, process.env.TAG_ID_SUPPORT_RESOLVED);
        await thread.setAppliedTags(appliedTags, '質問対応終了');
        await thread.setLocked(true);
        await thread.setArchived(true);

        await interaction.editReply({ components: await recoveryThinkingButton(interaction, 'クローズ済') });
    } catch (error) {
        logger.error(error);
    }
}
