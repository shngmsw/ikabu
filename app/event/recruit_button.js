const { MessageEmbed, MessageActionRow, MessageButton, Client } = require('discord.js');
const app = require('app-root-path').resolve('app');
const { isNotEmpty, datetimeDiff } = require(app + '/common');
module.exports = {
    join: join,
    cancel: cancel,
    del: del,
    close: close,
    unlock: unlock,
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
    if (err.code === 10062 || err.code === 40060) {
        return;
    } else {
        console.log(err);
    }
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
        await interaction.deferReply({
            ephemeral: true,
        });

        const guild = await interaction.guild.fetch();
        // APIからのメンバーオブジェクト(discord.jsのGuildMemberでないもの)がそのまま渡ってくることがあるのでfetchすることで確実にGuildMemberとする。
        // interaction.member.user.idでなければならない。なぜならば、APIInteractionGuildMemberはid を直接持たないからである。
        const member = await guild.members.fetch(interaction.member.user.id, {
            force: true, // intentsによってはGuildMemberUpdateが配信されないため
        });
        const header_msg_id = params.get('hmid');
        const header_message = await interaction.channel.messages.fetch(header_msg_id);
        const host_id = header_message.interaction.user.id;
        const channelId = params.get('vid');
        if (member.user.id === host_id) {
            await interaction.followUp({
                content: `募集主は参加表明できないでし！`,
                ephemeral: true,
            });
        } else {
            const member_mention = `<@!${member.user.id}>`;
            const embed = new MessageEmbed();
            embed.setAuthor({
                name: `${member.user.username}たんが参加表明したでし！`,
                iconURL: member.user.displayAvatarURL(),
            });

            await interaction.message.reply({
                content: `<@${host_id}> ${member_mention}`,
                embeds: [embed],
            });
            if (channelId == undefined) {
                await interaction.followUp({
                    content: `<@${host_id}>からの返答を待つでし！\n条件を満たさない場合は参加を断られる場合があるでし！`,
                    ephemeral: true,
                });
            } else {
                await interaction.followUp({
                    content: `<@${host_id}>からの返答を待つでし！\n条件を満たさない場合は参加を断られる場合があるでし！`,
                    components: [channelLinkButtons(interaction.guildId, channelId)],
                    ephemeral: true,
                });
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
        const guild = await interaction.guild.fetch();
        await guild.channels.fetch();
        const member = await guild.members.fetch(interaction.member.user.id, {
            force: true, // intentsによってはGuildMemberUpdateが配信されないため
        });
        const header_msg_id = params.get('hmid');
        const header_message = await interaction.channel.messages.fetch(header_msg_id);
        const host_id = header_message.interaction.user.id;
        const channelId = params.get('vid');
        const embed = new MessageEmbed().setDescription(`<@${host_id}>たんの募集〆`);
        if (member.user.id == host_id) {
            await interaction.update({
                content: `<@${host_id}>たんの募集はキャンセルされたでし！`,
                components: [disableButtons()],
            });
            await interaction.message.reply({ embeds: [embed] });
            if (channelId != undefined) {
                let channel = await guild.channels.cache.get(channelId);
                channel.permissionOverwrites.delete(guild.roles.everyone, 'UnLock Voice Channel');
                channel.permissionOverwrites.delete(interaction.member, 'UnLock Voice Channel');
            }
        } else {
            await interaction.deferReply({
                ephemeral: true,
            });
            await interaction.followUp({
                content: `キャンセルするときぐらい、自分の言葉で伝えましょう！\n<@${host_id}>たんにメンションつきで伝えるでし！`,
                ephemeral: true,
            });
        }
    } catch (err) {
        handleError(err, { interaction });
    }
}

async function del(interaction, params) {
    /** @type {Discord.Snowflake} */
    try {
        const guild = await interaction.guild.fetch();
        await guild.channels.fetch();
        const member = await guild.members.fetch(interaction.member.user.id, {
            force: true, // intentsによってはGuildMemberUpdateが配信されないため
        });
        const msg_id = params.get('mid');
        const cmd_message = await interaction.channel.messages.fetch(msg_id);
        const header_msg_id = params.get('hmid');
        const header_message = await interaction.channel.messages.fetch(header_msg_id);
        const host_id = header_message.interaction.user.id;
        const channelId = params.get('vid');
        if (member.user.id == host_id) {
            if (channelId != undefined) {
                let channel = await guild.channels.cache.get(channelId);
                channel.permissionOverwrites.delete(guild.roles.everyone, 'UnLock Voice Channel');
                channel.permissionOverwrites.delete(interaction.member, 'UnLock Voice Channel');
            }
            await cmd_message.delete();
            await header_message.delete();
        } else {
            interaction.reply({ content: '他人の募集は消せる訳無いでし！！！', ephemeral: true });
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
        const guild = await interaction.guild.fetch();
        await guild.channels.fetch();
        const member = await guild.members.fetch(interaction.member.user.id, {
            force: true, // intentsによってはGuildMemberUpdateが配信されないため
        });
        const header_msg_id = params.get('hmid');
        const header_message = await interaction.channel.messages.fetch(header_msg_id);
        const helpEmbed = await getHelpEmbed(guild, header_message.channel.id);
        const host_id = header_message.interaction.user.id;
        const channelId = params.get('vid');
        const embed = new MessageEmbed().setDescription(`<@${host_id}>たんの募集〆`);
        if (member.user.id === host_id) {
            await interaction.update({
                content: `<@${host_id}>たんの募集は〆！`,
                components: [disableButtons()],
            });
            await interaction.message.reply({ embeds: [embed] });
            await interaction.channel.send({ embeds: [helpEmbed] });
            if (channelId != undefined) {
                let channel = await guild.channels.cache.get(channelId);
                channel.permissionOverwrites.delete(guild.roles.everyone, 'UnLock Voice Channel');
                channel.permissionOverwrites.delete(interaction.member, 'UnLock Voice Channel');
            }
        } else if (datetimeDiff(new Date(), header_message.createdAt) > 120) {
            await interaction.update({
                content: `<@${host_id}>たんの募集は〆！`,
                components: [disableButtons()],
            });
            const embed = new MessageEmbed().setDescription(`<@${host_id}>たんの募集〆 \n <@${interaction.member.user.id}>たんが代理〆`);
            await interaction.message.reply({ embeds: [embed] });
            await header_message.channel.send({ embeds: [helpEmbed] });
            if (channelId != undefined) {
                let channel = await guild.channels.cache.get(channelId);
                channel.permissionOverwrites.delete(guild.roles.everyone, 'UnLock Voice Channel');
                channel.permissionOverwrites.delete(interaction.member, 'UnLock Voice Channel');
            }
        } else {
            await interaction.deferReply({
                ephemeral: true,
            });
            await interaction.followUp({
                content: `募集主以外は募集を〆られないでし。`,
                ephemeral: true,
            });
        }
    } catch (err) {
        handleError(err, { interaction });
    }
}

async function unlock(interaction, params) {
    /** @type {Discord.Snowflake} */

    try {
        const channelId = params.get('vid');
        const guild = await interaction.guild;
        const channel = await guild.channels.cache.get(channelId);

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
    const sendChannel = await guild.channels.cache.find((channel) => channel.id === chid);
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
        command = '`/別ゲー募集 apex` or `/別ゲー募集 dbd` or `/別ゲー募集 mhr` or `/別ゲー募集 valo` or `/別ゲー募集 other`';
    } else if (sendChannel.name.match('プラベ募集')) {
        command = '`/プラベ募集 recruit` or `/プラベ募集 button`';
    } else if (sendChannel.name.match('フェス')) {
        command = '`/〇〇陣営 fes` or `/fes`';
    }
    const embed = new MessageEmbed();
    embed.setDescription('募集コマンドは ' + `${command}` + `\n詳しくは <#${process.env.CHANNEL_ID_RECRUIT_HELP}> を確認するでし！`);
    return embed;
}

function disableButtons() {
    let buttons = new MessageActionRow().addComponents([
        new MessageButton().setCustomId('join').setLabel('参加').setStyle('PRIMARY').setDisabled(),
        new MessageButton().setCustomId('cancel').setLabel('キャンセル').setStyle('DANGER').setDisabled(),
        new MessageButton().setCustomId('close').setLabel('〆').setStyle('SECONDARY').setDisabled(),
    ]);
    return buttons;
}

function disableUnlockButton() {
    let buttons = new MessageActionRow().addComponents([
        new MessageButton().setCustomId('unlocked').setLabel('ロック解除済み').setStyle('SECONDARY').setDisabled(),
    ]);
    return buttons;
}

function channelLinkButtons(guildId, channelId) {
    const channel_link = `https://discord.com/channels/${guildId}/${channelId}`;
    let buttons = new MessageActionRow().addComponents([
        new MessageButton().setLabel('チャンネルに移動').setStyle('LINK').setURL(channel_link),
    ]);
    return buttons;
}
