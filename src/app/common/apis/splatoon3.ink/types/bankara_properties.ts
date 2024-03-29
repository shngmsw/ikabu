export type BankaraProperties = {
    startTime: string;
    endTime: string;
    bankaraMatchSettings: bankaraMatchSettings | null;
    festMatchSetting: {
        __typename: string;
    } | null;
};

export type bankaraMatchSettings = [
    {
        __isVsSetting: string;
        __typename: string;
        vsStages: [
            {
                vsStageId: number;
                name: string;
                image: {
                    url: string;
                };
                id: string;
            },
            {
                vsStageId: number;
                name: string;
                image: {
                    url: string;
                };
                id: string;
            },
        ];
        vsRule: {
            name: string;
            rule: string;
            id: string;
        };
        mode: string;
    },
    {
        __isVsSetting: string;
        __typename: string;
        vsStages: [
            {
                vsStageId: number;
                name: string;
                image: {
                    url: string;
                };
                id: string;
            },
            {
                vsStageId: number;
                name: string;
                image: {
                    url: string;
                };
                id: string;
            },
        ];
        vsRule: {
            name: string;
            rule: string;
            id: string;
        };
        mode: string;
    },
];
