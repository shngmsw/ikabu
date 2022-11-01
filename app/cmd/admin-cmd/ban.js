const { PermissionsBitField } = require('discord.js');
const log4js = require('log4js');

module.exports = async function handleBan(interaction) {
    if (!interaction.isCommand()) return;
    // 'インタラクションに失敗'が出ないようにするため
    await interaction.deferReply({ ephemeral: false });

    log4js.configure('config/log4js-config.json');
    const logger = log4js.getLogger('ban');

    const options = interaction.options;
    let banTarget = options.getUser('ban対象');
    let reason = options.getString('ban理由');

    if (interaction.member.permissions.has(PermissionsBitField.Flags.BanMembers)) {
        let memberId = banTarget.id;

        const guild = await interaction.guild.fetch();
        const member = await guild.members.fetch(memberId);

        let reasonText =
            'イカ部の管理人です。以下の理由によりイカ部から退部とさせていただきました。```' +
            reason +
            '```' +
            '申し訳ありませんが、質問等は受け付けておりませんので、よろしくお願いいたします。';

        let DMChannel = await member.createDM();
        await DMChannel.send({ content: reasonText }).catch((error) => {
            logger.error(error);
        });

        await member.ban({ reason: reasonText }).catch((error) => {
            logger.error(error);
        });
        const channels = await guild.channels.fetch();
        const banChannel = channels.find((channel) => channel.name === 'banコマンド');
        banChannel.send(`${member.user.tag}さんを以下の理由によりBANしました。\n` + reasonText);
        await interaction.editReply('BANしたでし！');
    } else {
        return await interaction.editReply('BANする権限がないでし！');
    }
};
