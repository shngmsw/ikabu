export type FestProperties = {
    startTime: string;
    endTime: string;
    festMatchSettings: festMatchSetting[];
};

type festMatchSetting = {
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
