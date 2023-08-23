import { Member } from '@prisma/client';
import { ButtonInteraction, EmbedBuilder } from 'discord.js';

import { getGuildByInteraction } from '../../common/manager/guild_manager';
import { searchDBMemberById } from '../../common/manager/member_manager';
import { assertExistCheck, notExists } from '../../common/others';

export async function sendRadioRequest(interaction: ButtonInteraction<'cached' | 'raw'>) {
    await interaction.deferReply({ ephemeral: true });

    const guild = await getGuildByInteraction(interaction);
    const sender = await searchDBMemberById(guild, interaction.member.user.id);

    const channel = interaction.channel;

    if (notExists(channel) || !channel.isVoiceBased()) return;

    assertExistCheck(sender, 'DBMember');

    const members = channel.members;

    if (members.size < 1) {
        await interaction.editReply({ content: 'そのVCには誰もいないでし！' });
        return;
    }

    let mentions = '';
    for (const member of members) {
        mentions += `<@${member[1].id}>`;
    }

    await channel.send({
        content: mentions,
        embeds: [createRadioRequestEmbed(sender)],
    });
    await interaction.deleteReply();
}

function createRadioRequestEmbed(member: Member) {
    const embed = new EmbedBuilder();
    embed.setAuthor({ name: member.displayName, iconURL: member.iconUrl });
    embed.setImage(
        'https://raw.githubusercontent.com/shngmsw/ikabu/stg/images/stamp/radio_request.png',
    );
    embed.setTimestamp();
    return embed;
}