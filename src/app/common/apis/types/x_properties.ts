export type XProperties = {
    startTime: string;
    endTime: string;
    xMatchSetting: {
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
    } | null;
    festMatchSetting: {
        __typename: string;
    } | null;
};
