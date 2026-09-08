import { describe, expect, it } from 'vitest';

import { PROFILE_WEAPONS } from '@/config/constants/profile_weapons';
import { findProfileWeapons } from '@/features/experience/profile_weapons';

describe('ブキ候補', () => {
    it('Discordの候補上限25件以内に収める', () => {
        expect(findProfileWeapons('')).toHaveLength(25);
    });
    it.each(['スプラシューター', 'すぷらしゅーたー', 'ｽﾌﾟﾗｼｭｰﾀｰ', 'sshooter'])(
        '%s で正式なブキを見つける',
        (query) => {
            expect(findProfileWeapons(query)).toContainEqual({
                name: 'スプラシューター',
                value: 'sshooter',
            });
        },
    );
    it('一致しない入力は候補なし', () => expect(findProfileWeapons('存在しないブキ')).toEqual([]));
    it('カタログのIDが重複せず、Discordで有効な候補を返す', () => {
        expect(new Set(PROFILE_WEAPONS.map((w) => w.key)).size).toBe(PROFILE_WEAPONS.length);
        for (const weapon of PROFILE_WEAPONS) {
            expect(weapon.key.length).toBeGreaterThan(0);
            expect(weapon.key.length).toBeLessThanOrEqual(40);
            expect(weapon.name.length).toBeLessThanOrEqual(100);
        }
    });
});
