import { ChatInputCommandInteraction, PermissionsBitField } from 'discord.js';

export async function shutdown(interaction: ChatInputCommandInteraction<'cached'>) {
    const member = interaction.member;
    if (!member.permissions.has(PermissionsBitField.Flags.ManageGuild)) {
        return await interaction.reply({
            content: '操作を実行する権限がないでし！',
            ephemeral: true,
        });
    }

    await interaction.reply({
        content: 'BOTをシャットダウンするでし！\n再起動までしばらく待つでし！',
    });

    process.exit(0);
}
