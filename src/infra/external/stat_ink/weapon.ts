export type Weapon = {
    key: string;
    aliases: string[];
    type: {
        key: string;
        aliases: [];
        name: {
            en_US: string;
            ja_JP: string;
        };
    };
    name: {
        en_US: string;
        ja_JP: string;
    };
    main: string;
    sub: {
        key: string;
        aliases: [];
        name: {
            en_US: string;
            ja_JP: string;
        };
    };
    special: {
        key: string;
        aliases: [];
        name: {
            en_US: string;
            ja_JP: string;
        };
    };
    reskin_of: string;
};
