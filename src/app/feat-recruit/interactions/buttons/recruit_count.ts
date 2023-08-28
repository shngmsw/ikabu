import { RecruitCountService } from '../../../../db/recruit_count_service';
import { exists } from '../../../common/others';

export async function increaseRecruitCount(userId: string) {
    const previousCount = await RecruitCountService.getCountByUserId(userId);
    if (exists(previousCount)) {
        await RecruitCountService.saveRecruitCount(userId, previousCount.recruitCount + 1);
    } else {
        await RecruitCountService.saveRecruitCount(userId, 1);
    }
}

export async function increaseJoinCount(userId: string) {
    const previousCount = await RecruitCountService.getCountByUserId(userId);
    if (exists(previousCount)) {
        await RecruitCountService.saveJoinCount(userId, previousCount.joinCount + 1);
    } else {
        await RecruitCountService.saveJoinCount(userId, 1);
    }
}
