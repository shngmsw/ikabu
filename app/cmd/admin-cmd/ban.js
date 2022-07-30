module.exports = async function handleBan(interaction) {
    if (!interaction.isCommand()) return;
    // 'インタラクションに失敗'が出ないようにするため
    await interaction.deferReply({ ephemeral: false });

    const options = interaction.options;
    let banTarget = options.getUser('ban対象');
    let reason = options.getString('ban理由');

    if (interaction.member.permissions.has('BAN_MEMBERS')) {
        let memberId = banTarget.id;
        let member;
        if (memberId.length == 18) {
            member = await interaction.guild.members.cache.get(memberId);
        } else {
            member = await interaction.guild.members.cache.find((member) => member.user.tag === memberId);
        }

        let reasonText =
            'イカ部の管理人です。以下の理由によりイカ部から退部とさせていただきました。```' +
            reason +
            '```' +
            '申し訳ありませんが、質問等は受け付けておりませんので、よろしくお願いいたします。';

        let DMChannel = await member.createDM();
        await DMChannel.send({ content: reasonText }).catch(console.error);

        await member.ban({ reason: reasonText }).catch(console.error);

        const banChannel = interaction.guild.channels.cache.find((channel) => channel.name === 'banコマンド');
        banChannel.send(`${member.user.tag}さんを以下の理由によりBANしました。\n` + reasonText);
    } else {
        return interaction.editReply('BANする権限がないでし！');
    }
};
