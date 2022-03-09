const { MessageEmbed, MessageActionRow, MessageButton, Client } = require('discord.js');
const { isNotEmpty } = require('../common');
module.exports = {
    join: join,
    cancel: cancel,
    close: close,
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
    const msg_id = params.get('mid');
    await interaction.deferReply({
        ephemeral: true,
    });

    try {
        const guild = await interaction.guild.fetch();
        // APIからのメンバーオブジェクト(discord.jsのGuildMemberでないもの)がそのまま渡ってくることがあるのでfetchすることで確実にGuildMemberとする。
        // interaction.member.user.idでなければならない。なぜならば、APIInteractionGuildMemberはid を直接持たないからである。
        const member = await guild.members.fetch(interaction.member.user.id, {
            force: true, // intentsによってはGuildMemberUpdateが配信されないため
        });
        const cmd_message = await interaction.channel.messages.fetch(msg_id);
        if (member.user.id === cmd_message.author.id) {
            await interaction.followUp({
                content: `募集主は参加表明できないでし！`,
                ephemeral: true,
            });
        } else {
            const member_mention = `<@!${member.user.id}>`;
            const host_mention = `<@!${cmd_message.author.id}>`;
            let member_roles = member.roles.cache.map((role) => (role.name != '@everyone' ? role.name : '')).join(' / ');
            const embed = new MessageEmbed();
            embed.setDescription(`募集主は${member.user.username}たんに遊ぶ部屋を伝えるでし！イカ部心得を守って楽しく遊んでほしいでし！`);
            embed.setAuthor({
                name: `${member.user.username}たんが参加表明したでし！`,
                iconURL: member.user.displayAvatarURL(),
            });
            embed.addFields({
                name: `${member.user.username}の役職`,
                value: isNotEmpty(member_roles) ? member_roles : 'なし',
            });
            await interaction.message.reply({
                content: `${host_mention} ${member_mention}`,
                embeds: [embed],
            });
            await interaction.followUp({
                content: `${host_mention}からの返答を待つでし！\n条件を満たさない場合は参加を断られる場合があるでし！`,
                ephemeral: true,
            });
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
        const member = await guild.members.fetch(interaction.member.user.id, {
            force: true, // intentsによってはGuildMemberUpdateが配信されないため
        });
        const msg_id = params.get('mid');
        const cmd_message = await interaction.channel.messages.fetch(msg_id);
        const host_mention = `<@${cmd_message.author.id}>`;
        const embed = new MessageEmbed().setDescription(`${host_mention}たんの募集〆`);
        if (member.user.id === cmd_message.author.id) {
            await interaction.update({
                content: `${host_mention}たんの募集はキャンセルされたでし！`,
                components: [disableButtons()],
            });
            await interaction.message.reply({ embeds: [embed] });
        } else {
            await interaction.deferReply({
                ephemeral: true,
            });
            await interaction.followUp({
                content: `キャンセルするときぐらい、自分の言葉で伝えましょう！\n${host_mention}たんにメンションつきで伝えるでし！`,
                ephemeral: true,
            });
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
        const member = await guild.members.fetch(interaction.member.user.id, {
            force: true, // intentsによってはGuildMemberUpdateが配信されないため
        });
        const msg_id = params.get('mid');
        const cmd_message = await interaction.channel.messages.fetch(msg_id);
        const host_mention = `<@${cmd_message.author.id}>`;
        const embed = new MessageEmbed().setDescription(`${host_mention}たんの募集〆`);
        if (member.user.id === cmd_message.author.id) {
            await interaction.update({
                content: `${host_mention}たんの募集は〆！`,
                components: [disableButtons()],
            });
            await interaction.message.reply({ embeds: [embed] });
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

function disableButtons() {
    let buttons = new MessageActionRow().addComponents([
        new MessageButton().setCustomId('join').setLabel('参加').setStyle('PRIMARY').setDisabled(),
        new MessageButton().setCustomId('cancel').setLabel('キャンセル').setStyle('DANGER').setDisabled(),
        new MessageButton().setCustomId('close').setLabel('〆').setStyle('SECONDARY').setDisabled(),
    ]);
    return buttons;
}
