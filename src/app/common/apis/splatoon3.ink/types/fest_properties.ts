export type FestProperties = {
    startTime: string;
    endTime: string;
    festMatchSettings: festMatchSettings | null;
};

type festMatchSettings = [
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
    },
];
