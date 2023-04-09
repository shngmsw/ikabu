import { EmbedBuilder } from 'discord.js';
import fetch from 'node-fetch';
import { log4js_obj } from '../../../log4js_settings';
import { searchAPIMemberById } from '../../common/manager/member_manager';
import { randomSelect } from '../../common/others';
const weaponsUrl = 'https://stat.ink/api/v3/weapon';

const logger = log4js_obj.getLogger('interaction');

export async function handleBuki(interaction: $TSFixMe) {
    if (!interaction.isCommand()) return;
    // 'インタラクションに失敗'が出ないようにするため
    await interaction.deferReply();
    buki(interaction);
}

export async function buki(interaction: $TSFixMe) {
    const { options } = interaction;
    const bukiType = options.getString('ブキ種');
    const amount = options.getInteger('ブキの数');
    if (amount > 10) {
        await interaction.followUp('一度に指定できるのは10個まででし！');
        return;
    }

    try {
        const response = await fetch(weaponsUrl);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const weapons = (await response.json()) as any;
        const guild = await interaction.guild.fetch();
        const member = await searchAPIMemberById(guild, interaction.member.user.id);
        const bukis = weapons.filter(function (value: $TSFixMe) {
            if (bukiType != null) {
                // 特定のbukiTypeが指定されているとき
                return bukiType === value.type.key;
            } else if (!~value.name.ja_JP.indexOf('ヒーロー')) {
                return true;
            }
        });
        const bukiNames = bukis.map(function (value: $TSFixMe) {
            const embed = new EmbedBuilder()
                .setAuthor({
                    name: member.displayName + 'のブキ',
                    iconURL: member.displayAvatarURL(),
                })
                .setColor(0xf02d7d)
                .setTitle(value.name.ja_JP)
                .addFields({
                    value: value.name.en_US,
                    name: value.sub.name.ja_JP + ' / ' + value.special.name.ja_JP,
                });
            return embed;
        });

        if (amount) {
            const length = bukiNames.length;
            const embeds = [];
            for (let i = 0; i < amount; i++) {
                embeds.push(bukiNames[Math.floor(Math.random() * length)]);
            }
            await interaction.followUp({
                embeds: embeds,
            });
        } else {
            const buki = randomSelect(bukiNames, 1)[0];
            await interaction.followUp({ embeds: [buki] });
        }
    } catch (error) {
        await interaction.followUp('なんかエラーでてるわ');
        logger.error(error);
    }
}
