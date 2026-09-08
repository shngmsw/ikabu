import { PROFILE_WEAPONS } from '@/config/constants/profile_weapons';

function normalize(value: string) {
    return value
        .normalize('NFKC')
        .toLowerCase()
        .replace(/[ァ-ヶ]/gu, (char) => String.fromCharCode(char.charCodeAt(0) - 0x60))
        .replace(/\s/gu, '');
}

export function findProfileWeapons(query: string) {
    const search = normalize(query);
    return PROFILE_WEAPONS.filter(
        (weapon) => normalize(weapon.name).includes(search) || weapon.key.includes(search),
    )
        .slice(0, 25)
        .map((weapon) => ({ name: weapon.name, value: weapon.key }));
}
