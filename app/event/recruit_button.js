const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { isEmpty, datetimeDiff } = require('../common');
const { insert_recruit } = require('../../db/recruit_insert');
const { delete_recruit, deleteRecruitByMemberId } = require('../../db/recruit_delete.js');
const { getRecruitMessageByMemberId, getRecruitAllByMessageId } = require('../../db/recruit_select.js');
const { searchMemberById } = require('../manager/memberManager.js');
const { searchMessageById, getFullMessageObject } = require('../manager/messageManager.js');
const { searchChannelById } = require('../manager/channelManager.js');
const { recruitActionRow, notifyActionRow, thinkingActionRow } = require('../common/button_components');
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const axios = require('axios');
const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;

module.exports = {
    join: join,
    cancel: cancel,
    del: del,
    close: close,
    joinNotify: joinNotify,
    cancelNotify: cancelNotify,
    closeNotify: closeNotify,
    unlock: unlock,
    sendLogWebhook: sendLogWebhook,
};

async function sendLogWebhook(log_content) {
    await axios.post(
        DISCORD_WEBHOOK_URL,
        { content: log_content }, // このオブジェクトがJSONとして送信される
    );
}

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
    //     console.log(`err:${err.code}`);
    // } else {
    //     await sendLogWebhook(err.code);
    //     await sendLogWebhook({
    //         member_user_id: member.user.id,
    //         channel_id: interaction.channel.id,
    //         message_id: interaction.message.id,
    //         member_id: interaction.member.id,
    //     });
    console.log(err);
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
        await interaction.update({ components: [thinkingActionRow('join')] });

        const guild = await interaction.guild.fetch();
        // interaction.member.user.idでなければならない。なぜならば、APIInteractionGuildMemberはid を直接持たないからである。
        const member = await searchMemberById(guild, interaction.member.user.id);
        const header_msg_id = params.get('hmid');
        const header_message = await getFullMessageObject(guild, interaction.channel, header_msg_id);
        const host = header_message.interaction.user;
        const host_id = host.id;
        let channelId = params.get('vid');
        if (isEmpty(channelId)) {
            channelId = null;
        }

        await sendLogWebhook(`${host.tag}[${host.id}]の募集で${member.displayName}たんが参加ボタンを押したでし`);

        if (member.user.id === host_id) {
            await interaction.followUp({
                content: `募集主は参加表明できないでし！`,
                ephemeral: true,
            });

            await interaction.editReply({ components: [recruitActionRow(header_message, channelId)] });

            return;
        } else {
            // 参加済みかチェック
            const member_data = await getRecruitMessageByMemberId(interaction.message.id, member.user.id);
            if (member_data.length > 0) {
                await interaction.followUp({
                    content: `すでに参加ボタンを押してるでし！`,
                    ephemeral: true,
                });

                await interaction.editReply({ components: [recruitActionRow(header_message, channelId)] });

                return;
            }

            const embed = new EmbedBuilder();
            embed.setAuthor({
                name: `${member.displayName}たんが参加表明したでし！`,
                iconURL: member.displayAvatarURL(),
            });

            // recruitテーブルにデータ追加
            await insert_recruit(interaction.message.id, host_id, member.user.id);

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
                components: [recruitActionRow(header_message, channelId)],
            });

            // 5分後にホストへの通知を削除
            if (notify_to_host_message != null) {
                await sleep(300000);
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
        await interaction.update({ components: [thinkingActionRow('cancel')] });

        const guild = await interaction.guild.fetch();
        const member = await searchMemberById(guild, interaction.member.user.id);
        const header_msg_id = params.get('hmid');
        const header_message = await getFullMessageObject(guild, interaction.channel, header_msg_id);
        const host = header_message.interaction.user;
        const host_id = host.id;
        const embed = new EmbedBuilder().setDescription(`<@${host_id}>たんの募集〆`);
        const cmd_message = interaction.message;
        let channelId = params.get('vid');
        if (isEmpty(channelId)) {
            channelId = null;
        }

        await sendLogWebhook(`${host.tag}[${host.id}]の募集で${member.displayName}たんがキャンセルボタンを押したでし`);

        if (member.user.id == host_id) {
            // recruitテーブルから削除
            await delete_recruit(interaction.message.id);

            if (channelId != null) {
                let channel = await searchChannelById(guild, channelId);
                channel.permissionOverwrites.delete(guild.roles.everyone, 'UnLock Voice Channel');
                channel.permissionOverwrites.delete(interaction.member, 'UnLock Voice Channel');
            }

            await cmd_message.edit({
                content: `<@${host_id}>たんの募集はキャンセルされたでし！`,
                components: [disableButtons()],
            });
            await interaction.followUp({ embeds: [embed], ephemeral: false });
        } else {
            // NOTE: 参加表明済みかチェックして、参加表明済みならキャンセル可能
            const member_data = await getRecruitMessageByMemberId(interaction.message.id, member.user.id);
            if (member_data.length > 0) {
                // recruitテーブルから自分のデータのみ削除
                await deleteRecruitByMemberId(interaction.message.id, interaction.member.id);

                // ホストに通知
                await interaction.message.reply({
                    content: `<@${host_id}> <@${interaction.member.id}>たんがキャンセルしたでし！`,
                });
                await interaction.editReply({
                    content: await memberListMessage(interaction),
                    components: [recruitActionRow(header_message, channelId)],
                });
            } else {
                await interaction.followUp({
                    content: `他人の募集は勝手にキャンセルできないでし！！`,
                    ephemeral: true,
                });
                await interaction.editReply({ components: [recruitActionRow(header_message, channelId)] });
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
        const cmd_message = await searchMessageById(guild, interaction.channel, msg_id);
        const header_msg_id = params.get('hmid');
        const header_message = await getFullMessageObject(guild, interaction.channel, header_msg_id);
        const host = header_message.interaction.user;
        const host_id = host.id;
        let channelId = params.get('vid');
        if (isEmpty(channelId)) {
            channelId = null;
        }
        if (member.user.id == host_id) {
            if (channelId != null) {
                let channel = await searchChannelById(guild, channelId);
                channel.permissionOverwrites.delete(guild.roles.everyone, 'UnLock Voice Channel');
                channel.permissionOverwrites.delete(interaction.member, 'UnLock Voice Channel');
            }
            await interaction.message.delete();
            await cmd_message.delete();
            await header_message.delete();

            // recruitテーブルから削除
            await delete_recruit(interaction.message.id);
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
        await interaction.update({ components: [thinkingActionRow('close')] });

        const guild = await interaction.guild.fetch();
        const member = await searchMemberById(guild, interaction.member.user.id);
        const header_msg_id = params.get('hmid');
        const header_message = await getFullMessageObject(guild, interaction.channel, header_msg_id);
        const helpEmbed = await getHelpEmbed(guild, header_message.channel.id);
        const host = header_message.interaction.user;
        const host_id = host.id;
        const embed = new EmbedBuilder().setDescription(`<@${host_id}>たんの募集〆`);
        const cmd_message = interaction.message;
        let channelId = params.get('vid');
        if (isEmpty(channelId)) {
            channelId = null;
        }

        await sendLogWebhook(`${host.tag}[${host.id}]の募集で${member.displayName}たんが〆ボタンを押したでし`);

        if (member.user.id === host_id) {
            const recruit_data = await getRecruitAllByMessageId(interaction.message.id);
            const member_list = getMemberMentions(recruit_data);

            // recruitテーブルから削除
            await delete_recruit(interaction.message.id);

            if (channelId != null) {
                let channel = await searchChannelById(guild, channelId);
                channel.permissionOverwrites.delete(guild.roles.everyone, 'UnLock Voice Channel');
                channel.permissionOverwrites.delete(interaction.member, 'UnLock Voice Channel');
            }
            await cmd_message.edit({
                content: `<@${host_id}>たんの募集は〆！\n${member_list}`,
                components: [disableButtons()],
            });
            await interaction.followUp({ embeds: [embed], ephemeral: false });
            await interaction.channel.send({ embeds: [helpEmbed] });
        } else if (datetimeDiff(new Date(), header_message.createdAt) > 120) {
            const recruit_data = await getRecruitAllByMessageId(interaction.message.id);
            const member_list = getMemberMentions(recruit_data);
            // recruitテーブルから削除
            deleteRecruitByMemberId(interaction.message.id, interaction.member.id);

            if (channelId != null) {
                let channel = await searchChannelById(guild, channelId);
                channel.permissionOverwrites.delete(guild.roles.everyone, 'UnLock Voice Channel');
                channel.permissionOverwrites.delete(interaction.member, 'UnLock Voice Channel');
            }
            await cmd_message.edit({
                content: `<@${host_id}>たんの募集は〆！\n${member_list}`,
                components: [disableButtons()],
            });
            const embed = new EmbedBuilder().setDescription(`<@${host_id}>たんの募集〆 \n <@${interaction.member.user.id}>たんが代理〆`);
            await interaction.followUp({ embeds: [embed], ephemeral: false });
            await interaction.channel.send({ embeds: [helpEmbed] });
        } else {
            await interaction.followUp({
                content: `募集主以外は募集を〆られないでし。`,
                ephemeral: true,
            });
            await interaction.editReply({ components: [recruitActionRow(header_message, channelId)] });
        }
    } catch (err) {
        handleError(err, { interaction });
    }
}

async function joinNotify(interaction, params) {
    /** @type {Discord.Snowflake} */
    try {
        await interaction.update({ components: [thinkingActionRow('join')] });

        const guild = await interaction.guild.fetch();
        // interaction.member.user.idでなければならない。なぜならば、APIInteractionGuildMemberはid を直接持たないからである。
        const member = await searchMemberById(guild, interaction.member.user.id);
        const host_id = params.get('hid');
        if (member.user.id === host_id) {
            await interaction.followUp({
                content: `募集主は参加表明できないでし！`,
                ephemeral: true,
            });

            await interaction.editReply({ components: [notifyActionRow(host_id)] });

            return;
        } else {
            // 参加済みかチェック
            const member_data = await getRecruitMessageByMemberId(interaction.message.id, member.user.id);
            if (member_data.length > 0) {
                await interaction.followUp({
                    content: `すでに参加ボタンを押してるでし！`,
                    ephemeral: true,
                });

                await interaction.editReply({ components: [notifyActionRow(host_id)] });

                return;
            }

            const embed = new EmbedBuilder();
            embed.setAuthor({
                name: `${member.displayName}たんが参加表明したでし！`,
                iconURL: member.displayAvatarURL(),
            });
            // recruitテーブルにデータ追加
            await insert_recruit(interaction.message.id, interaction.member.user.id, member.user.id);

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
                components: [notifyActionRow(host_id)],
            });

            // 5分後にホストへの通知を削除
            if (notify_to_host_message != null) {
                await sleep(300000);
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
        await interaction.update({ components: [thinkingActionRow('cancel')] });

        const guild = await interaction.guild.fetch();
        const member = await searchMemberById(guild, interaction.member.user.id);
        const host_id = params.get('hid');
        const embed = new EmbedBuilder().setDescription(`<@${host_id}>たんの募集〆`);
        const cmd_message = interaction.message;

        if (member.user.id == host_id) {
            // recruitテーブルから削除
            await delete_recruit(interaction.message.id);
            await cmd_message.edit({
                content: `<@${host_id}>たんの募集はキャンセルされたでし！`,
                components: [disableButtons()],
            });
            await interaction.followUp({ embeds: [embed], ephemeral: false });
        } else {
            // NOTE: 参加表明済みかチェックして、参加表明済みならキャンセル可能
            const member_data = await getRecruitMessageByMemberId(interaction.message.id, member.user.id);
            if (member_data.length > 0) {
                // recruitテーブルから自分のデータのみ削除
                await deleteRecruitByMemberId(interaction.message.id, interaction.member.id);

                // ホストに通知
                await interaction.message.reply({
                    content: `<@${host_id}> <@${interaction.member.id}>たんがキャンセルしたでし！`,
                });
                await interaction.editReply({
                    content: await memberListMessage(interaction),
                    components: [notifyActionRow(host_id)],
                });
            } else {
                await interaction.followUp({
                    content: `他人の募集は勝手にキャンセルできないでし！！`,
                    ephemeral: true,
                });
                await interaction.editReply({ components: [notifyActionRow(host_id)] });
            }
        }
    } catch (err) {
        handleError(err, { interaction });
    }
}

async function closeNotify(interaction, params) {
    /** @type {Discord.Snowflake} */
    try {
        await interaction.update({ components: [thinkingActionRow('close')] });

        const guild = await interaction.guild.fetch();
        const member = await searchMemberById(guild, interaction.member.user.id);
        const host_id = params.get('hid');
        const embed = new EmbedBuilder().setDescription(`<@${host_id}>たんの募集〆`);
        const helpEmbed = await getHelpEmbed(guild, interaction.channel.id);
        const cmd_message = interaction.message;

        if (member.user.id === host_id) {
            const recruit_data = await getRecruitAllByMessageId(interaction.message.id);
            const member_list = getMemberMentions(recruit_data);
            await cmd_message.edit({
                content: `<@${host_id}>たんの募集は〆！\n${member_list}`,
                components: [disableButtons()],
            });
            // recruitテーブルから削除
            await delete_recruit(interaction.message.id);
            await interaction.followUp({ embeds: [embed], ephemeral: false });
            await interaction.channel.send({ embeds: [helpEmbed] });

            return;
        } else if (datetimeDiff(new Date(), interaction.message.createdAt) > 120) {
            const recruit_data = await getRecruitAllByMessageId(interaction.message.id);
            const member_list = getMemberMentions(recruit_data);
            await cmd_message.edit({
                content: `<@${host_id}>たんの募集は〆！\n${member_list}`,
                components: [disableButtons()],
            });
            // recruitテーブルから削除
            deleteRecruitByMemberId(interaction.message.id);
            const embed = new EmbedBuilder().setDescription(`<@${host_id}>たんの募集〆 \n <@${interaction.member.user.id}>たんが代理〆`);
            await interaction.followUp({ embeds: [embed], ephemeral: false });
            await interaction.channel.send({ embeds: [helpEmbed] });
        } else {
            await interaction.followUp({
                content: `募集主以外は募集を〆られないでし。`,
                ephemeral: true,
            });
        }

        await interaction.editReply({ components: [notifyActionRow(host_id)] });
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

async function getHelpEmbed(guild, chid) {
    const channels = await guild.channels.fetch();
    const sendChannel = channels.find((channel) => channel.id === chid);
    let command = '';
    if (sendChannel.name.match('リグマ募集')) {
        command = '`/リグマ募集 now` or `/リグマ募集 next`';
    } else if (sendChannel.name.match('ナワバリ')) {
        command = '`/ナワバリ募集 now` or `/ナワバリ募集 next`';
    } else if (sendChannel.name.match('バンカラ募集')) {
        command = '`/バンカラ募集 now` or `/バンカラ募集 next`';
    } else if (sendChannel.name.match('サーモン募集')) {
        command = '`/サーモンラン募集 run`';
    } else if (sendChannel.name.match('別ゲー募集')) {
        command = '`/別ゲー募集 apex` or `/別ゲー募集 overwatch` or `/別ゲー募集 mhr` or `/別ゲー募集 valo` or `/別ゲー募集 other`';
    } else if (sendChannel.name.match('プラベ募集')) {
        command = '`/プラベ募集 recruit` or `/プラベ募集 button`';
    } else if (sendChannel.name.match('フェス')) {
        command = '`/〇〇陣営 now` or `/〇〇陣営 next`';
    }
    const embed = new EmbedBuilder();
    embed.setDescription('募集コマンドは ' + `${command}` + `\n詳しくは <#${process.env.CHANNEL_ID_RECRUIT_HELP}> を確認するでし！`);
    return embed;
}

function disableButtons() {
    let buttons = new ActionRowBuilder().addComponents([
        new ButtonBuilder().setCustomId('join').setLabel('参加').setStyle(ButtonStyle.Primary).setDisabled(),
        new ButtonBuilder().setCustomId('cancel').setLabel('キャンセル').setStyle(ButtonStyle.Danger).setDisabled(),
        new ButtonBuilder().setCustomId('close').setLabel('〆').setStyle(ButtonStyle.Secondary).setDisabled(),
    ]);
    return buttons;
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
    let mentionString = `【参加表明一覧】`;
    for (let i = 0; i < members.length; i++) {
        const member = members[i].member_id;
        mentionString = mentionString + `\n<@${member}> `;
    }
    return mentionString;
}

async function memberListMessage(interaction) {
    const recruit_data = await getRecruitAllByMessageId(interaction.message.id);
    const member_list = getMemberMentions(recruit_data);
    const message_first_row = interaction.message.content.split('\n')[0];
    return message_first_row + '\n' + member_list;
}
