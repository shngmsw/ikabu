export type EventProperties = {
    leagueMatchSetting: {
        leagueMatchEvent: {
            leagueMatchEventId: string;
            name: string;
            desc: string;
            regulationUrl: null;
            regulation: string;
            id: string;
        };
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
        __isVsSetting: string;
        __typename: string;
        vsRule: {
            name: string;
            rule: string;
            id: string;
        };
    };
    timePeriods: [
        {
            startTime: string;
            endTime: string;
        },
        {
            startTime: string;
            endTime: string;
        },
        {
            startTime: string;
            endTime: string;
        },
    ];
};
