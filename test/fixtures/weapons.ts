import { Weapon } from '@/infra/external/stat_ink/weapon';

export function weapon(key = 'sshooter', name = 'スプラシューター'): Weapon {
    return {
        key,
        name: { ja_JP: name, en_US: 'Splattershot' },
        aliases: [],
        type: { key: 'shooter', aliases: [], name: { ja_JP: 'シューター', en_US: 'Shooter' } },
        main: key,
        reskin_of: '',
        sub: { key: 'bomb', aliases: [], name: { ja_JP: 'ボム', en_US: 'Bomb' } },
        special: { key: 'special', aliases: [], name: { ja_JP: 'スペシャル', en_US: 'Special' } },
    };
}
