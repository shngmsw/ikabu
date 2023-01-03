const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { isEmpty, datetimeDiff, sleep, getCommandHelpEmbed, isNotEmpty, getMentionsFromMessage } = require('../../../common');
const RecruitService = require('../../../../db/recruit_service.js');
const { searchMemberById } = require('../../../manager/memberManager.js');
const { searchMessageById } = require('../../../manager/messageManager.js');
const { searchChannelById } = require('../../../manager/channelManager.js');
const { recoveryThinkingButton, disableThinkingButton, setButtonDisable } = require('../../../common/button_components');
const log4js = require('log4js');
const { sendContentWebhook } = require('../../../common/webhook');
const { createNewRecruitButton } = require('../components/create_recruit_buttons');

log4js.configure(process.env.LOG4JS_CONFIG_PATH);
const logger = log4js.getLogger('recruitButton');

module.exports = {
    join: join,
    cancel: cancel,
    del: del,
    close: close,
    joinNotify: joinNotify,
    cancelNotify: cancelNotify,
    closeNotify: closeNotify,
    unlock: unlock,
    getMemberMentions: getMemberMentions,
};

/**
 *
 * @param {unknown} err
 * @param {object} ctx
 * @param {Discord.ButtonInteraction} ctx.interaction
 * @param {Discord.Snowflake} ctx.role_id
 * @param {string} ctx.role_mention
 * @returns
 */
async function handleError(err, { interaction }) {
    // UnKnown Interactionエラーはコンポーネント削除してるから出ちゃうのはしょうがないっぽい？のでスルー
    // if (err.code === 10062 || err.code === 40060) {
    //     logger.error(`err:${err.code}`);
    // } else {
    //     await sendLogWebhook(err.code);
    //     await sendLogWebhook({
    //         member_user_id: member.user.id,
    //         channel_id: interaction.channel.id,
    //         message_id: interaction.message.id,
    //         member_id: interaction.member.id,
    //     });
    logger.error(err);
    // }
}
/**
 *
 * @param {Discord.ButtonInteraction} interaction
 * @param {URLSearchParams} params
 * @returns
 */
async function join(interaction, params) {
    /** @type {Discord.Snowflake} */
    try {
        await interaction.update({ components: await setButtonDisable(interaction.message, interaction) });

        const guild = await interaction.guild.fetch();
        // interaction.member.user.idでなければならない。なぜならば、APIInteractionGuildMemberはid を直接持たないからである。
        const member = await searchMemberById(guild, interaction.member.user.id);
        const header_msg_id = params.get('hmid');
        const header_message = await searchMessageById(guild, interaction.channelId, header_msg_id);
        let host_id;
        if (isNotEmpty(header_message.interaction)) {
            let host = header_message.interaction.user;
            host_id = host.id;
        } else {
            let mentions = getMentionsFromMessage(header_message, true);
            host_id = mentions[0];
        }
        const host_member = await searchMemberById(guild, host_id);
        let channelId = params.get('vid');
        if (isEmpty(channelId)) {
            channelId = null;
        }

        await sendContentWebhook(
            process.env.BUTTON_LOG_WEBHOOK_URL,
            `${host_member.displayName}[${host_id}]の募集で${member.displayName}たんが〆ボタンを押したでし`,
        );

        if (member.user.id === host_id) {
            await interaction.followUp({
                content: `募集主は参加表明できないでし！`,
                ephemeral: true,
            });

            await interaction.editReply({ components: await recoveryThinkingButton(interaction, '参加') });
            return;
        } else {
            // 参加済みかチェック
            const member_data = await RecruitService.getRecruitMessageByMemberId(interaction.message.id, member.user.id);
            if (member_data.length > 0) {
                await interaction.followUp({
                    content: `すでに参加ボタンを押してるでし！`,
                    ephemeral: true,
                });

                await interaction.editReply({ components: await recoveryThinkingButton(interaction, '参加') });
                return;
            }

            const embed = new EmbedBuilder();
            embed.setAuthor({
                name: `${member.displayName}たんが参加表明したでし！`,
                iconURL: member.displayAvatarURL(),
            });

            // recruitテーブルにデータ追加
            await RecruitService.save(interaction.message.id, host_id, member.user.id);

            // ホストがVCにいるかチェックして、VCにいる場合はtext in voiceにメッセージ送信
            let notify_to_host_message = null;
            let host_guild_member = await searchMemberById(guild, host_id);
            if (host_guild_member.voice.channelId) {
                let host_joined_vc = interaction.guild.channels.cache.find((channel) => channel.id === host_guild_member.voice.channelId);
                await host_joined_vc.send({
                    embeds: [embed],
                    components: [messageLinkButtons(interaction.guildId, interaction.channel.id, interaction.message.id)],
                });
                notify_to_host_message = await interaction.message.reply({
                    content: `<@${host_id}>`,
                    embeds: [embed],
                });
            } else {
                notify_to_host_message = await interaction.message.reply({
                    content: `<@${host_id}>`,
                    embeds: [embed],
                });
            }

            if (channelId == null) {
                await interaction.followUp({
                    content: `<@${host_id}>からの返答を待つでし！\n条件を満たさない場合は参加を断られる場合があるでし！`,
                    // components: [channelLinkButtons(interaction.guildId, thread_message.url)], TODO: スレッド内へのリンクボタンを作る
                    ephemeral: true,
                });
            } else {
                await interaction.followUp({
                    content: `<@${host_id}>からの返答を待つでし！\n条件を満たさない場合は参加を断られる場合があるでし！`,
                    components: [channelLinkButtons(interaction.guildId, channelId)],
                    ephemeral: true,
                });
            }

            await interaction.editReply({
                content: await memberListMessage(interaction),
                components: await recoveryThinkingButton(interaction, '参加'),
            });

            // 5分後にホストへの通知を削除
            if (notify_to_host_message != null) {
                await sleep(300);
                notify_to_host_message.delete();
            }
        }
    } catch (err) {
        handleError(err, { interaction });
    }
}

/**
 *
 * @param {Discord.ButtonInteraction} interaction
 * @param {URLSearchParams} params
 * @returns
 */
async function cancel(interaction, params) {
    /** @type {Discord.Snowflake} */
    try {
        await interaction.update({ components: await setButtonDisable(interaction.message, interaction) });

        const guild = await interaction.guild.fetch();
        const member = await searchMemberById(guild, interaction.member.user.id);
        const header_msg_id = params.get('hmid');
        const header_message = await searchMessageById(guild, interaction.channelId, header_msg_id);
        let host_id;
        if (isNotEmpty(header_message.interaction)) {
            let host = header_message.interaction.user;
            host_id = host.id;
        } else {
            let mentions = getMentionsFromMessage(header_message, true);
            host_id = mentions[0];
        }
        const host_member = await searchMemberById(guild, host_id);
        const embed = new EmbedBuilder().setDescription(`<@${host_id}>たんの募集〆`);
        const helpEmbed = getCommandHelpEmbed(interaction.channel.name);
        const cmd_message = interaction.message;
        let channelId = params.get('vid');
        if (isEmpty(channelId)) {
            channelId = null;
        }

        await sendContentWebhook(
            process.env.BUTTON_LOG_WEBHOOK_URL,
            `${host_member.displayName}[${host_id}]の募集で${member.displayName}たんが〆ボタンを押したでし`,
        );

        if (member.user.id == host_id) {
            // ピン留め解除
            header_message.unpin();

            // recruitテーブルから削除
            await RecruitService.deleteByMessageId(interaction.message.id);

            if (channelId != null) {
                let channel = await searchChannelById(guild, channelId);
                channel.permissionOverwrites.delete(guild.roles.everyone, 'UnLock Voice Channel');
                channel.permissionOverwrites.delete(interaction.member, 'UnLock Voice Channel');
            }

            await cmd_message.edit({
                content: `<@${host_id}>たんの募集はキャンセルされたでし！`,
                components: await disableThinkingButton(interaction, 'キャンセル'),
            });
            await interaction.followUp({ embeds: [embed], ephemeral: false });
            await interaction.channel.send({ embeds: [helpEmbed], components: [createNewRecruitButton(interaction.channel.name)] });
        } else {
            // NOTE: 参加表明済みかチェックして、参加表明済みならキャンセル可能
            const member_data = await RecruitService.getRecruitMessageByMemberId(interaction.message.id, member.user.id);
            if (member_data.length > 0) {
                // recruitテーブルから自分のデータのみ削除
                await RecruitService.deleteByMemberId(interaction.message.id, interaction.member.id);

                // ホストに通知
                await interaction.message.reply({
                    content: `<@${host_id}> <@${interaction.member.id}>たんがキャンセルしたでし！`,
                });
                await interaction.editReply({
                    content: await memberListMessage(interaction),
                    components: await recoveryThinkingButton(interaction, 'キャンセル'),
                });
            } else {
                await interaction.followUp({
                    content: `他人の募集は勝手にキャンセルできないでし！！`,
                    ephemeral: true,
                });
                await interaction.editReply({ components: await recoveryThinkingButton(interaction, 'キャンセル') });
            }
        }
    } catch (err) {
        handleError(err, { interaction });
    }
}

async function del(interaction, params) {
    /** @type {Discord.Snowflake} */
    try {
        // 処理待ち
        await interaction.deferReply({
            ephemeral: true,
        });

        const guild = await interaction.guild.fetch();
        const member = await searchMemberById(guild, interaction.member.user.id);
        const msg_id = params.get('mid');
        const cmd_message = await searchMessageById(guild, interaction.channelId, msg_id);
        const header_msg_id = params.get('hmid');
        const header_message = await searchMessageById(guild, interaction.channelId, header_msg_id);
        let host_id;
        if (isNotEmpty(header_message.interaction)) {
            let host = header_message.interaction.user;
            host_id = host.id;
        } else {
            let mentions = getMentionsFromMessage(header_message, true);
            host_id = mentions[0];
        }
        const host_member = await searchMemberById(guild, host_id);
        let channelId = params.get('vid');

        await sendContentWebhook(
            process.env.BUTTON_LOG_WEBHOOK_URL,
            `${host_member.displayName}[${host_id}]の募集で${member.displayName}たんが〆ボタンを押したでし`,
        );

        if (isEmpty(channelId)) {
            channelId = null;
        }
        if (member.user.id == host_id) {
            if (channelId != null) {
                let channel = await searchChannelById(guild, channelId);
                channel.permissionOverwrites.delete(guild.roles.everyone, 'UnLock Voice Channel');
                channel.permissionOverwrites.delete(interaction.member, 'UnLock Voice Channel');
            }
            try {
                await interaction.message.delete();
            } catch (error) {
                logger.warn('button already deleted');
            }
            await cmd_message.delete();
            await header_message.delete();

            // recruitテーブルから削除
            await RecruitService.deleteByMessageId(interaction.message.id);
            await interaction.editReply({
                content: '募集を削除したでし！\n次回は内容をしっかり確認してから送信するでし！',
                ephemeral: true,
            });
        } else {
            await interaction.editReply({ content: '他人の募集は消せる訳無いでし！！！', ephemeral: true });
        }
    } catch (err) {
        handleError(err, { interaction });
    }
}

/**
 *
 * @param {Discord.ButtonInteraction} interaction
 * @param {URLSearchParams} params
 * @returns
 */
async function close(interaction, params) {
    /** @type {Discord.Snowflake} */
    try {
        await interaction.update({ components: await setButtonDisable(interaction.message, interaction) });

        const guild = await interaction.guild.fetch();
        const member = await searchMemberById(guild, interaction.member.user.id);
        const header_msg_id = params.get('hmid');
        const header_message = await searchMessageById(guild, interaction.channelId, header_msg_id);
        const helpEmbed = getCommandHelpEmbed(header_message.channel.name);
        let host_id;
        if (isNotEmpty(header_message.interaction)) {
            let host = header_message.interaction.user;
            host_id = host.id;
        } else {
            let mentions = getMentionsFromMessage(header_message, true);
            host_id = mentions[0];
        }
        const host_member = await searchMemberById(guild, host_id);
        const embed = new EmbedBuilder().setDescription(`<@${host_id}>たんの募集〆`);
        const cmd_message = interaction.message;
        let channelId = params.get('vid');
        if (isEmpty(channelId)) {
            channelId = null;
        }

        await sendContentWebhook(
            process.env.BUTTON_LOG_WEBHOOK_URL,
            `${host_member.displayName}[${host_id}]の募集で${member.displayName}たんが〆ボタンを押したでし`,
        );

        if (member.user.id === host_id) {
            const recruit_data = await RecruitService.getRecruitAllByMessageId(interaction.message.id);
            const member_list = getMemberMentions(recruit_data);
            // ピン留め解除
            header_message.unpin();

            // recruitテーブルから削除
            await RecruitService.deleteByMessageId(interaction.message.id);

            if (channelId != null) {
                let channel = await searchChannelById(guild, channelId);
                channel.permissionOverwrites.delete(guild.roles.everyone, 'UnLock Voice Channel');
                channel.permissionOverwrites.delete(interaction.member, 'UnLock Voice Channel');
            }
            await cmd_message.edit({
                content: `<@${host_id}>たんの募集は〆！\n${member_list}`,
                components: await disableThinkingButton(interaction, '〆'),
            });
            await interaction.followUp({ embeds: [embed], ephemeral: false });
            await interaction.channel.send({ embeds: [helpEmbed], components: [createNewRecruitButton(header_message.channel.name)] });
        } else if (datetimeDiff(new Date(), header_message.createdAt) > 120) {
            const recruit_data = await RecruitService.getRecruitAllByMessageId(interaction.message.id);
            const member_list = getMemberMentions(recruit_data);

            header_message.unpin();

            // recruitテーブルから削除
            await RecruitService.deleteByMemberId(interaction.message.id, interaction.member.id);

            if (channelId != null) {
                let channel = await searchChannelById(guild, channelId);
                channel.permissionOverwrites.delete(guild.roles.everyone, 'UnLock Voice Channel');
                channel.permissionOverwrites.delete(interaction.member, 'UnLock Voice Channel');
            }
            await cmd_message.edit({
                content: `<@${host_id}>たんの募集は〆！\n${member_list}`,
                components: await disableThinkingButton(interaction, '〆'),
            });
            const embed = new EmbedBuilder().setDescription(`<@${host_id}>たんの募集〆 \n <@${interaction.member.user.id}>たんが代理〆`);
            await interaction.followUp({ embeds: [embed], ephemeral: false });
            await interaction.channel.send({ embeds: [helpEmbed], components: [createNewRecruitButton(header_message.channel.name)] });
        } else {
            await interaction.followUp({
                content: `募集主以外は募集を〆られないでし。`,
                ephemeral: true,
            });
            await interaction.editReply({ components: await recoveryThinkingButton(interaction, '〆') });
        }
    } catch (err) {
        handleError(err, { interaction });
    }
}

async function joinNotify(interaction, params) {
    /** @type {Discord.Snowflake} */
    try {
        await interaction.update({ components: await setButtonDisable(interaction.message, interaction) });

        const guild = await interaction.guild.fetch();
        // interaction.member.user.idでなければならない。なぜならば、APIInteractionGuildMemberはid を直接持たないからである。
        const member = await searchMemberById(guild, interaction.member.user.id);
        const host_id = params.get('hid');
        if (member.user.id === host_id) {
            await interaction.followUp({
                content: `募集主は参加表明できないでし！`,
                ephemeral: true,
            });

            await interaction.editReply({ components: await recoveryThinkingButton(interaction, '参加') });

            return;
        } else {
            // 参加済みかチェック
            const member_data = await RecruitService.getRecruitMessageByMemberId(interaction.message.id, member.user.id);
            if (member_data.length > 0) {
                await interaction.followUp({
                    content: `すでに参加ボタンを押してるでし！`,
                    ephemeral: true,
                });

                await interaction.editReply({ components: await recoveryThinkingButton(interaction, '参加') });

                return;
            }

            const embed = new EmbedBuilder();
            embed.setAuthor({
                name: `${member.displayName}たんが参加表明したでし！`,
                iconURL: member.displayAvatarURL(),
            });
            // recruitテーブルにデータ追加
            await RecruitService.save(interaction.message.id, interaction.member.user.id, member.user.id);

            // ホストがVCにいるかチェックして、VCにいる場合はtext in voiceにメッセージ送信
            let notify_to_host_message = null;
            let host_guild_member = await searchMemberById(guild, host_id);
            if (host_guild_member.voice.channelId) {
                let host_joined_vc = interaction.guild.channels.cache.find((channel) => channel.id === host_guild_member.voice.channelId);
                await host_joined_vc.send({
                    content: `<@${host_id}>`,
                    embeds: [embed],
                    components: [messageLinkButtons(interaction.guildId, interaction.channel.id, interaction.message.id)],
                });
            } else {
                notify_to_host_message = await interaction.message.reply({
                    content: `<@${host_id}>`,
                    embeds: [embed],
                });
            }

            await interaction.followUp({
                content: `<@${host_id}>からの返答を待つでし！\n条件を満たさない場合は参加を断られる場合があるでし！`,
                ephemeral: true,
            });

            await interaction.editReply({
                content: await memberListMessage(interaction),
                components: await recoveryThinkingButton(interaction, '参加'),
            });

            // 5分後にホストへの通知を削除
            if (notify_to_host_message != null) {
                await sleep(300);
                notify_to_host_message.delete();
            }
        }
    } catch (err) {
        handleError(err, { interaction });
    }
}

async function cancelNotify(interaction, params) {
    /** @type {Discord.Snowflake} */
    try {
        await interaction.update({ components: await setButtonDisable(interaction.message, interaction) });

        const guild = await interaction.guild.fetch();
        const member = await searchMemberById(guild, interaction.member.user.id);
        const host_id = params.get('hid');
        const embed = new EmbedBuilder().setDescription(`<@${host_id}>たんの募集〆`);
        const cmd_message = interaction.message;

        if (member.user.id == host_id) {
            // ピン留め解除
            cmd_message.unpin();
            // recruitテーブルから削除
            await RecruitService.deleteByMessageId(interaction.message.id);
            await cmd_message.edit({
                content: `<@${host_id}>たんの募集はキャンセルされたでし！`,
                components: await disableThinkingButton(interaction, 'キャンセル'),
            });
            await interaction.followUp({ embeds: [embed], ephemeral: false });
        } else {
            // NOTE: 参加表明済みかチェックして、参加表明済みならキャンセル可能
            const member_data = await RecruitService.getRecruitMessageByMemberId(interaction.message.id, member.user.id);
            if (member_data.length > 0) {
                // recruitテーブルから自分のデータのみ削除
                await RecruitService.deleteByMemberId(interaction.message.id, interaction.member.id);

                // ホストに通知
                await interaction.message.reply({
                    content: `<@${host_id}> <@${interaction.member.id}>たんがキャンセルしたでし！`,
                });
                await interaction.editReply({
                    content: await memberListMessage(interaction),
                    components: await recoveryThinkingButton(interaction, 'キャンセル'),
                });
            } else {
                await interaction.followUp({
                    content: `他人の募集は勝手にキャンセルできないでし！！`,
                    ephemeral: true,
                });
                await interaction.editReply({ components: await recoveryThinkingButton(interaction, 'キャンセル') });
            }
        }
    } catch (err) {
        handleError(err, { interaction });
    }
}

async function closeNotify(interaction, params) {
    /** @type {Discord.Snowflake} */
    try {
        await interaction.update({ components: await setButtonDisable(interaction.message, interaction) });

        const guild = await interaction.guild.fetch();
        const member = await searchMemberById(guild, interaction.member.user.id);
        const host_id = params.get('hid');
        const embed = new EmbedBuilder().setDescription(`<@${host_id}>たんの募集〆`);
        const helpEmbed = getCommandHelpEmbed(interaction.channel.name);
        const cmd_message = interaction.message;

        if (member.user.id === host_id) {
            const recruit_data = await RecruitService.getRecruitAllByMessageId(interaction.message.id);
            const member_list = getMemberMentions(recruit_data);
            await cmd_message.edit({
                content: `<@${host_id}>たんの募集は〆！\n${member_list}`,
                components: await disableThinkingButton(interaction, '〆'),
            });
            // ピン留め解除
            cmd_message.unpin();
            // recruitテーブルから削除
            await RecruitService.deleteByMessageId(interaction.message.id);
            await interaction.followUp({ embeds: [embed], ephemeral: false });
            await interaction.channel.send({ embeds: [helpEmbed], components: [createNewRecruitButton(interaction.channel.name)] });

            return;
        } else if (datetimeDiff(new Date(), interaction.message.createdAt) > 120) {
            const recruit_data = await RecruitService.getRecruitAllByMessageId(interaction.message.id);
            const member_list = getMemberMentions(recruit_data);

            cmd_message.unpin();

            await cmd_message.edit({
                content: `<@${host_id}>たんの募集は〆！\n${member_list}`,
                components: await disableThinkingButton(interaction, '〆'),
            });
            // recruitテーブルから削除
            await RecruitService.deleteByMessageId(interaction.message.id);
            const embed = new EmbedBuilder().setDescription(`<@${host_id}>たんの募集〆 \n <@${interaction.member.user.id}>たんが代理〆`);
            await interaction.followUp({ embeds: [embed], ephemeral: false });
            await interaction.channel.send({ embeds: [helpEmbed], components: [createNewRecruitButton(interaction.channel.name)] });
        } else {
            await interaction.followUp({
                content: `募集主以外は募集を〆られないでし。`,
                ephemeral: true,
            });
            await interaction.editReply({ components: await recoveryThinkingButton(interaction, '〆') });
        }
    } catch (err) {
        handleError(err, { interaction });
    }
}

async function unlock(interaction, params) {
    /** @type {Discord.Snowflake} */

    try {
        const channelId = params.get('vid');
        const guild = await interaction.guild.fetch();
        const channel = await searchChannelById(guild, channelId);

        channel.permissionOverwrites.delete(guild.roles.everyone, 'UnLock Voice Channel');
        channel.permissionOverwrites.delete(interaction.member, 'UnLock Voice Channel');

        await interaction.update({
            components: [disableUnlockButton()],
        });
    } catch (err) {
        handleError(err, { interaction });
    }
}

function disableUnlockButton() {
    let buttons = new ActionRowBuilder().addComponents([
        new ButtonBuilder().setCustomId('unlocked').setLabel('ロック解除済み').setStyle(ButtonStyle.Secondary).setDisabled(),
    ]);
    return buttons;
}

function channelLinkButtons(guildId, channelId) {
    const channel_link = `https://discord.com/channels/${guildId}/${channelId}`;
    let buttons = new ActionRowBuilder().addComponents([
        new ButtonBuilder().setLabel('チャンネルに移動').setStyle(ButtonStyle.Link).setURL(channel_link),
    ]);
    return buttons;
}
function messageLinkButtons(guildId, channelId, messageId, label) {
    const link = `https://discord.com/channels/${guildId}/${channelId}/${messageId}`;

    let buttons = new ActionRowBuilder().addComponents([
        new ButtonBuilder()
            .setLabel(label != null ? label : 'メッセージを表示')
            .setStyle(ButtonStyle.Link)
            .setURL(link),
    ]);
    return buttons;
}

function getMemberMentions(members) {
    let mentionString = `**【参加表明一覧】**` + `\`[${members.length}]\``;
    for (let i = 0; i < members.length; i++) {
        const member = members[i].member_id;
        mentionString = mentionString + `\n<@${member}> `;
    }
    return mentionString;
}

async function memberListMessage(interaction) {
    const recruit_data = await RecruitService.getRecruitAllByMessageId(interaction.message.id);
    const member_list = getMemberMentions(recruit_data);
    const message_first_row = interaction.message.content.split('\n')[0];
    return message_first_row + '\n' + member_list;
}
