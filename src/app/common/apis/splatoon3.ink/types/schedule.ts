import { BankaraProperties } from './bankara_properties';
import { EventProperties } from './event_properties';
import { FestProperties } from './fest_properties';
import { RegularProperties } from './regular_properties';
import { BigRunProperties, SalmonRegularProperties, TeamContestProperties } from './salmon_properties';
import { XProperties } from './x_properties';

export type Sp3Schedule = {
    regularSchedules: {
        nodes: RegularProperties[];
    };
    bankaraSchedules: {
        nodes: BankaraProperties[];
    };
    xSchedules: {
        nodes: XProperties[];
    };
    eventSchedules: {
        nodes: EventProperties[];
    };
    festSchedules: {
        nodes: FestProperties[];
    };
    coopGroupingSchedule: {
        bannerImage: {
            url: string;
        };
        regularSchedules: {
            nodes: SalmonRegularProperties[];
        };
        bigRunSchedules: {
            nodes: BigRunProperties[];
        };
        teamContestSchedules: { nodes: TeamContestProperties[] };
    };
};
