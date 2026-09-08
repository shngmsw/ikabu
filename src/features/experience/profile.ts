import {
    AttachmentBuilder,
    AutocompleteInteraction,
    ChatInputCommandInteraction,
    MessageFlags,
} from 'discord.js';

import { PROFILE_WEAPONS } from '@/config/constants/profile_weapons';
import { RoleKeySet } from '@/config/constants/role_key';
import { FriendCodeService } from '@/infra/db/repositories/friend_code_service';
import { MemberService } from '@/infra/db/repositories/member_service';
import { MessageCountService } from '@/infra/db/repositories/message_count_service';
import { ProfileService } from '@/infra/db/repositories/profile_service';
import { UniqueRoleService } from '@/infra/db/repositories/unique_role_service';

import { renderProfileCard } from './profile_card';
import { findProfileWeapons } from './profile_weapons';

export async function handleProfile(interaction: ChatInputCommandInteraction<'cached'>) {
    await interaction.deferReply();
    const userId = interaction.user.id;
    const [storedMember, friendCode, messages, profile, supporterRoleId] = await Promise.all([
        MemberService.getMemberByUserId(interaction.guildId, userId),
        FriendCodeService.getFriendCodeObjByUserId(userId),
        MessageCountService.getMemberByUserId(userId),
        ProfileService.get(userId),
        UniqueRoleService.getRoleIdByKey(interaction.guildId, RoleKeySet.Supporter.key),
    ]);
    const member = interaction.member;
    const roles = [...member.roles.cache.values()]
        .filter((role) => role.id !== interaction.guildId)
        .sort((a, b) => {
            if (a.id === supporterRoleId) return -1;
            if (b.id === supporterRoleId) return 1;
            return b.comparePositionTo(a);
        });
    const card = await renderProfileCard({
        displayName: member.displayName,
        avatarUrl: member.displayAvatarURL({ extension: 'png', size: 256 }),
        joinedAt: storedMember?.joinedAt ?? member.joinedAt,
        friendCode: friendCode?.code ?? null,
        messageCount: messages?.count ?? 0,
        favoriteWeapon: profile?.favoriteWeapon ?? null,
        isSupporter: supporterRoleId !== null && member.roles.cache.has(supporterRoleId),
        badges: roles.map((role) => ({
            name: role.name,
            iconUrl: role.iconURL({ extension: 'png', size: 64 }),
            emoji: role.unicodeEmoji,
            color: role.hexColor,
        })),
    });
    await interaction.editReply({
        files: [
            new AttachmentBuilder(card, {
                name: 'ikabu_profile.png',
                description: 'イカ部プロフィール',
            }),
        ],
    });
}

export async function handleProfileSettings(interaction: ChatInputCommandInteraction<'cached'>) {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });
    if (interaction.options.getSubcommand() === 'ブキ解除') {
        await ProfileService.clearWeapon(interaction.user.id);
        await interaction.editReply('好きなブキの登録を解除したでし！');
        return;
    }
    const key = interaction.options.getString('名前', true);
    const weapon = PROFILE_WEAPONS.find((candidate) => candidate.key === key);
    if (!weapon) {
        await interaction.editReply('ブキは表示された候補から選んでほしいでし！');
        return;
    }
    await ProfileService.setWeapon(interaction.user.id, weapon.name);
    await interaction.editReply('好きなブキを登録したでし！ `/プロフィール` で確認できるでし！');
}

export async function autocompleteProfileWeapon(interaction: AutocompleteInteraction) {
    const focused = interaction.options.getFocused(true);
    if (interaction.options.getSubcommand() !== 'ブキ' || focused.name !== '名前') {
        await interaction.respond([]);
        return;
    }
    await interaction.respond(findProfileWeapons(String(focused.value)));
}
