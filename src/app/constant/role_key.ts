import { ObjectValueList } from './constant_common';

// 固有の機能ロールを増やすときはここに追加するだけでOK
export const RoleKeySet = {
    Developer: { name: 'DEVELOPER', key: 'ROLE_ID_DEVELOPER' },
    Rookie: { name: '新入部員', key: 'ROLE_ID_ROOKIE' },
    PrivateRecruit: { name: 'プラベ募集', key: 'ROLE_ID_RECRUIT_PRIVATE' },
    RegularRecruit: { name: 'ナワバリ募集', key: 'ROLE_ID_RECRUIT_REGULAR' },
    AnarchyRecruit: { name: 'バンカラ募集', key: 'ROLE_ID_RECRUIT_ANARCHY' },
    EventRecruit: { name: 'イベマ募集', key: 'ROLE_ID_RECRUIT_EVENT' },
    SalmonRecruit: { name: 'サーモン募集', key: 'ROLE_ID_RECRUIT_SALMON' },
    FryeRecruit: { name: 'ウツホ募集', key: 'ROLE_ID_RECRUIT_FRYE' },
    ShiverRecruit: { name: 'フウカ募集', key: 'ROLE_ID_RECRUIT_SHIVER' },
    BigmanRecruit: { name: 'マンタロー募集', key: 'ROLE_ID_RECRUIT_BIGMAN' },
    OtherGamesRecruit: { name: '別ゲー募集', key: 'ROLE_ID_RECRUIT_OTHERGAMES' },
} as const;
export type RoleKeySet = ObjectValueList<typeof RoleKeySet>;
// RoleKeyタイプを派生させる
export type RoleKey = (typeof RoleKeySet)[keyof typeof RoleKeySet]['key'];

// 指定した文字列がRoleKeyに存在するかチェックする関数
export function isRoleKey(value: string): value is RoleKey {
    return Object.values(RoleKeySet).some((v) => v.key === value);
}

// RoleKeyを指定すると名前を返す関数
export function getUniqueRoleNameByKey(roleKey: RoleKey): string | null {
    for (const role of Object.values(RoleKeySet)) {
        if (role.key === roleKey) {
            return role.name;
        }
    }
    return null; // キーが見つからない場合はnullを返す
}
