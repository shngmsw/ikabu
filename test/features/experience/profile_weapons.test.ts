import { describe, expect, it } from 'vitest';

import { findProfileWeapons } from '@/features/experience/profile_weapons';

import { weapon } from '../../fixtures/weapons';

const weapons = Array.from({ length: 30 }, (_, i) =>
    i === 0 ? weapon() : weapon(`new_${i}`, `追加ブキ${i}`),
);

describe('ブキ候補', () => {
    it('Discordの候補上限25件以内に収める', () => {
        expect(findProfileWeapons('', weapons)).toHaveLength(25);
    });
    it.each(['スプラシューター', 'すぷらしゅーたー', 'ｽﾌﾟﾗｼｭｰﾀｰ', 'sshooter'])(
        '%s で正式なブキを見つける',
        (query) => {
            expect(findProfileWeapons(query, weapons)).toContainEqual({
                name: 'スプラシューター',
                value: 'sshooter',
            });
        },
    );
    it('一致しない入力は候補なし', () =>
        expect(findProfileWeapons('存在しないブキ', weapons)).toEqual([]));
    it('APIから追加されたブキも候補になる', () => {
        expect(findProfileWeapons('追加ブキ29', weapons)).toEqual([
            { name: '追加ブキ29', value: 'new_29' },
        ]);
    });
});
