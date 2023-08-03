import { ChatInputCommandInteraction, PermissionsBitField } from 'discord.js';

import { log4js_obj } from '../../../log4js_settings';
import { getGuildByInteraction } from '../../common/manager/guild_manager';
import { searchAPIMemberById } from '../../common/manager/member_manager';
import { assertExistCheck, exists } from '../../common/others';

const logger = log4js_obj.getLogger('ban');

export async function handleBan(interaction: ChatInputCommandInteraction<'cached' | 'raw'>) {
    // 'インタラクションに失敗'が出ないようにするため
    await interaction.deferReply({ ephemeral: false });

    const guild = await getGuildByInteraction(interaction);
    const member = await searchAPIMemberById(guild, interaction.member.user.id);
    assertExistCheck(member, 'member');
    const options = interaction.options;
    const banTarget = options.getUser('ban対象', true);
    const reason = options.getString('ban理由');

    if (member.permissions.has(PermissionsBitField.Flags.BanMembers)) {
        const targetId = banTarget.id;

        const targetMember = await searchAPIMemberById(guild, targetId);
        assertExistCheck(targetMember, 'targetMember');

        const reasonText =
            'イカ部の管理人です。以下の理由によりイカ部から退部とさせていただきました。```' +
            reason +
            '```' +
            '申し訳ありませんが、質問等は受け付けておりませんので、よろしくお願いいたします。';

        const DMChannel = await targetMember.createDM();
        await DMChannel.send({ content: reasonText }).catch((error) => {
            logger.error(error);
        });

        await targetMember.ban({ reason: reasonText }).catch((error) => {
            logger.error(error);
        });

        const channels = await guild.channels.fetch();
        const banChannel = channels.find(
            (channel) => exists(channel) && channel.name === 'banコマンド',
        );
        if (exists(banChannel) && banChannel.isTextBased()) {
            await banChannel.send(
                `${targetMember.displayName}さん\`[${targetMember.user.username}]\`を以下の理由によりBANしました。\n` +
                    reasonText,
            );
        }
        await interaction.editReply('BANしたでし！');
    } else {
        return await interaction.editReply('BANする権限がないでし！');
    }
}
