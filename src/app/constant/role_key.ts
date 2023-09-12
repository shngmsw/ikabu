import { ObjectValueList } from './constant_common';

// 固有の機能ロールを増やすときはここに追加するだけでOK
export const RoleKeySet = {
    test: { name: 'テストロール', key: 'ROLE_ID_TEST' },
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
