import { PermissionsBitField } from 'discord.js';
import { log4js_obj } from '../../../log4js_settings';

export async function handleBan(interaction: $TSFixMe) {
    if (!interaction.isCommand()) return;
    // 'インタラクションに失敗'が出ないようにするため
    await interaction.deferReply({ ephemeral: false });

    const logger = log4js_obj.getLogger('ban');

    const options = interaction.options;
    const banTarget = options.getUser('ban対象');
    const reason = options.getString('ban理由');

    if (interaction.member.permissions.has(PermissionsBitField.Flags.BanMembers)) {
        const memberId = banTarget.id;

        const guild = await interaction.guild.fetch();
        const member = await guild.members.fetch(memberId);

        const reasonText =
            'イカ部の管理人です。以下の理由によりイカ部から退部とさせていただきました。```' +
            reason +
            '```' +
            '申し訳ありませんが、質問等は受け付けておりませんので、よろしくお願いいたします。';

        const DMChannel = await member.createDM();
        await DMChannel.send({ content: reasonText }).catch((error: $TSFixMe) => {
            logger.error(error);
        });

        await member.ban({ reason: reasonText }).catch((error: $TSFixMe) => {
            logger.error(error);
        });
        const channels = await guild.channels.fetch();
        const banChannel = channels.find((channel: $TSFixMe) => channel.name === 'banコマンド');
        banChannel.send(`${member.user.tag}さんを以下の理由によりBANしました。\n` + reasonText);
        await interaction.editReply('BANしたでし！');
    } else {
        return await interaction.editReply('BANする権限がないでし！');
    }
}
