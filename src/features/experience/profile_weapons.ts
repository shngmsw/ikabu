import { Weapon } from '@/infra/external/stat_ink/weapon';

function normalize(value: string) {
    return value
        .normalize('NFKC')
        .toLowerCase()
        .replace(/[ァ-ヶ]/gu, (char) => String.fromCharCode(char.charCodeAt(0) - 0x60))
        .replace(/\s/gu, '');
}

export function findProfileWeapons(query: string, weapons: Weapon[]) {
    const search = normalize(query);
    return weapons
        .filter(
            (weapon) =>
                normalize(weapon.name.ja_JP).includes(search) || weapon.key.includes(search),
        )
        .slice(0, 25)
        .map((weapon) => ({ name: weapon.name.ja_JP, value: weapon.key }));
}
