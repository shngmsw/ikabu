module.exports = async function handleBan(interaction) {
    if (!interaction.isCommand()) return;
    // 'インタラクションに失敗'が出ないようにするため
    await interaction.deferReply({ ephemeral: false });

    const options = interaction.options;
    let banTarget = options.getUser('ban対象');
    let reason = options.getString('ban理由');

    if (interaction.member.permissions.has('BAN_MEMBERS')) {
        let memberId = banTarget.id;

        const member = await interaction.guild.members.fetch(memberId);

        let reasonText =
            'イカ部の管理人です。以下の理由によりイカ部から退部とさせていただきました。```' +
            reason +
            '```' +
            '申し訳ありませんが、質問等は受け付けておりませんので、よろしくお願いいたします。';

        let DMChannel = await member.createDM();
        await DMChannel.send({ content: reasonText }).catch(console.error);

        await member.ban({ reason: reasonText }).catch(console.error);
        const channels = await interaction.guild.channels.fetch();
        const banChannel = channels.find((channel) => channel.name === 'banコマンド');
        banChannel.send(`${member.user.tag}さんを以下の理由によりBANしました。\n` + reasonText);
        interaction.editReply('BANしたでし！');
    } else {
        return interaction.editReply('BANする権限がないでし！');
    }
};
