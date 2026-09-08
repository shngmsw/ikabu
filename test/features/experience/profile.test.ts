import { Collection, MessageFlags } from 'discord.js';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
    member: vi.fn(),
    friend: vi.fn(),
    messages: vi.fn(),
    profile: vi.fn(),
    supporter: vi.fn(),
    render: vi.fn(),
    save: vi.fn(),
    clear: vi.fn(),
}));
vi.mock('@/infra/db/repositories/member_service', () => ({
    MemberService: { getMemberByUserId: mocks.member },
}));
vi.mock('@/infra/db/repositories/friend_code_service', () => ({
    FriendCodeService: { getFriendCodeObjByUserId: mocks.friend },
}));
vi.mock('@/infra/db/repositories/message_count_service', () => ({
    MessageCountService: { getMemberByUserId: mocks.messages },
}));
vi.mock('@/infra/db/repositories/profile_service', () => ({
    ProfileService: { get: mocks.profile, setWeapon: mocks.save, clearWeapon: mocks.clear },
}));
vi.mock('@/infra/db/repositories/unique_role_service', () => ({
    UniqueRoleService: { getRoleIdByKey: mocks.supporter },
}));
vi.mock('@/features/experience/profile_card', () => ({ renderProfileCard: mocks.render }));

import { handleIkabuExperience } from '@/features/experience/experience';
import { handleProfile, handleProfileSettings } from '@/features/experience/profile';
import { profileCommand, profileSettingsCommand } from '@/features/experience/profile_command';

function interaction() {
    return {
        user: { id: 'self' },
        guildId: 'guild',
        member: {
            displayName: '現在の名前',
            joinedAt: new Date('2025-01-01'),
            displayAvatarURL: vi.fn().mockReturnValue('https://cdn.discordapp.com/avatar.png'),
            roles: { cache: new Collection() },
        },
        options: {
            getSubcommand: vi.fn().mockReturnValue('ブキ'),
            getString: vi.fn().mockReturnValue(' スプラシューター '),
        },
        deferReply: vi.fn(),
        editReply: vi.fn(),
    };
}
type Interaction = Parameters<typeof handleProfile>[0];

beforeEach(() => {
    vi.resetAllMocks();
    for (const fn of [mocks.member, mocks.friend, mocks.messages, mocks.profile, mocks.supporter])
        fn.mockResolvedValue(null);
    mocks.render.mockResolvedValue(Buffer.from('png'));
});

describe('プロフィール表示', () => {
    it('未登録ならDiscordの入部日、0件、未設定の項目で画像を返す', async () => {
        const i = interaction();
        await handleProfile(i as unknown as Interaction);
        expect(i.deferReply).toHaveBeenCalled();
        expect(mocks.render).toHaveBeenCalledWith(
            expect.objectContaining({
                displayName: '現在の名前',
                joinedAt: new Date('2025-01-01'),
                messageCount: 0,
                friendCode: null,
                favoriteWeapon: null,
                isSupporter: false,
                badges: [],
            }),
        );
        expect(i.editReply.mock.calls[0][0].files[0].name).toBe('ikabu_profile.png');
        expect(mocks.member).toHaveBeenCalledWith('guild', 'self');
    });
    it('補正済み入部日と保存済みの情報を使い、設定されたロールIDでサポーターを判定する', async () => {
        const i = interaction();
        mocks.member.mockResolvedValue({
            joinedAt: new Date('2020-03-01'),
            displayName: '古い名前',
        });
        mocks.friend.mockResolvedValue({ code: 'SW-1234-5678-9012' });
        mocks.messages.mockResolvedValue({ count: 1234 });
        mocks.profile.mockResolvedValue({ favoriteWeapon: 'わかばシューター' });
        mocks.supporter.mockResolvedValue('support');
        i.member.roles.cache.set('guild', { id: 'guild' });
        i.member.roles.cache.set('support', {
            id: 'support',
            name: '応援団',
            iconURL: () => 'https://cdn.discordapp.com/role.png',
            unicodeEmoji: null,
            hexColor: '#ffeedd',
        });
        await handleProfile(i as unknown as Interaction);
        expect(mocks.render).toHaveBeenCalledWith(
            expect.objectContaining({
                joinedAt: new Date('2020-03-01'),
                displayName: '現在の名前',
                messageCount: 1234,
                friendCode: 'SW-1234-5678-9012',
                favoriteWeapon: 'わかばシューター',
                isSupporter: true,
                badges: [
                    {
                        name: '応援団',
                        iconUrl: 'https://cdn.discordapp.com/role.png',
                        emoji: null,
                        color: '#ffeedd',
                    },
                ],
            }),
        );
    });
    it('サポーターロールの設定だけでは専用枠を付けない', async () => {
        mocks.supporter.mockResolvedValue('someone-else');
        await handleProfile(interaction() as unknown as Interaction);
        expect(mocks.render).toHaveBeenCalledWith(expect.objectContaining({ isSupporter: false }));
    });
    it('DB障害を未登録として隠さず呼び出し元へ伝える', async () => {
        mocks.profile.mockRejectedValue(new Error('db'));
        await expect(handleProfile(interaction() as unknown as Interaction)).rejects.toThrow('db');
        expect(mocks.render).not.toHaveBeenCalled();
    });
    it('従来のイカ部歴コマンドも同じハンドラを使う', () => {
        expect(handleIkabuExperience).toBe(handleProfile);
        expect(profileCommand.guildOnly).toBe(true);
        expect(profileSettingsCommand.guildOnly).toBe(true);
    });
});

describe('プロフィール設定', () => {
    it('本人のブキを保存し、本人だけに応答する', async () => {
        const i = interaction();
        await handleProfileSettings(i as unknown as Interaction);
        expect(mocks.save).toHaveBeenCalledWith('self', 'スプラシューター');
        expect(i.deferReply).toHaveBeenCalledWith({ flags: MessageFlags.Ephemeral });
    });
    it.each(['   ', 'ブキ\nブキ', 'あ'.repeat(41)])('不正な入力は保存しない: %s', async (value) => {
        const i = interaction();
        i.options.getString.mockReturnValue(value);
        await handleProfileSettings(i as unknown as Interaction);
        expect(mocks.save).not.toHaveBeenCalled();
    });
    it('本人のブキを解除する', async () => {
        const i = interaction();
        i.options.getSubcommand.mockReturnValue('ブキ解除');
        await handleProfileSettings(i as unknown as Interaction);
        expect(mocks.clear).toHaveBeenCalledWith('self');
        expect(mocks.save).not.toHaveBeenCalled();
    });
});
