import { UniqueChannelService } from '../../../db/unique_channel_service';
import { ChannelKeySet } from '../../constant/channel_key';

export async function getFestPeriodAlertText(guildId: string) {
    const shiverChannelId = await UniqueChannelService.getChannelIdByKey(
        guildId,
        ChannelKeySet.ShiverRecruit.key,
    );
    const fryeChannelId = await UniqueChannelService.getChannelIdByKey(
        guildId,
        ChannelKeySet.FryeRecruit.key,
    );
    const bigmanChannelId = await UniqueChannelService.getChannelIdByKey(
        guildId,
        ChannelKeySet.BigmanRecruit.key,
    );

    return (
        `募集を建てようとした期間はフェス中でし！\n` +
        `\`<#${shiverChannelId}>\`, \`<#${fryeChannelId}>\`, \`<#${bigmanChannelId}>\`のチャンネルを使うでし！`
    );
}
