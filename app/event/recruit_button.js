const { MessageEmbed, MessageActionRow, MessageButton, Client } = require("discord.js");
const client = new Client({ intents: 0, partials: ["GUILD_MEMBER", "USER"] });
module.exports = {
    join: join,
    cancel: cancel,
    close: close
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
    if (err.code === 10062) {
        return;
    }
    console.log(err);
}

/**
 * 
 * @param {Discord.ButtonInteraction} interaction 
 * @param {URLSearchParams} params 
 * @returns 
 */
async function join(interaction, params) {
    /** @type {Discord.Snowflake} */
    const msg_id = params.get("mid");
    await interaction.deferReply({
        ephemeral: true
    });

    try {

        const guild = await interaction.guild.fetch();
        // APIからのメンバーオブジェクト(discord.jsのGuildMemberでないもの)がそのまま渡ってくることがあるのでfetchすることで確実にGuildMemberとする。
        // interaction.member.user.idでなければならない。なぜならば、APIInteractionGuildMemberはid を直接持たないからである。
        const member = await guild.members.fetch(interaction.member.user.id, {
            force: true // intentsによってはGuildMemberUpdateが配信されないため
        });
        const member_mention = `<@${member.user.id}>`;
        const cmd_message = await interaction.channel.messages.fetch(msg_id);
        const host_mention = `<@${cmd_message.author.id}>`;
        interaction.message.reply({ content: `${host_mention}\n${member_mention}たんが参加表明したでし！` })
        interaction.followUp({
            content: `${host_mention}からの返答を待つでし！\n条件を満たさない場合は参加を断られる場合があるでし！`
        });
    } catch (err) {
        handleError(err, { interaction })
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
            force: true // intentsによってはGuildMemberUpdateが配信されないため
        });
        const msg_id = params.get("mid");
        const cmd_message = await interaction.channel.messages.fetch(msg_id);
        const host_mention = `<@${cmd_message.author.id}>`;
        const embed = new MessageEmbed().setDescription(`${host_mention}たんの募集〆`);
        if (member.user.id === cmd_message.author.id) {
            await interaction.update({ content: `${host_mention}たんの募集はキャンセルされたでし！`, components: [disableButtons()] });
            interaction.message.reply({ embeds: [embed] });
        } else {
            await interaction.deferReply({
                ephemeral: true
            });
            await interaction.followUp({
                content: `キャンセルするときぐらい、自分の言葉で伝えましょう！\n${host_mention}たんにメンションつきで伝えるでし！`
            });
        }
    } catch (err) {
        handleError(err, { interaction })
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
            force: true // intentsによってはGuildMemberUpdateが配信されないため
        });
        const msg_id = params.get("mid");
        const cmd_message = await interaction.channel.messages.fetch(msg_id);
        const host_mention = `<@${cmd_message.author.id}>`;
        const embed = new MessageEmbed().setDescription(`${host_mention}たんの募集〆`);
        if (member.user.id === cmd_message.author.id) {
            await interaction.update({ content: `${host_mention}たんの募集は〆！`, components: [disableButtons()] });
            interaction.message.reply({ embeds: [embed] });
        } else {
            interaction.followUp({
                content: `募集主以外は募集を〆られないでし。`
            });
        }
    } catch (err) {
        handleError(err, { interaction })
    }
}

function disableButtons() {
    let buttons = new MessageActionRow()
        .addComponents(
            [
                new MessageButton()
                    .setCustomId("join")
                    .setLabel("参加")
                    .setStyle("PRIMARY").setDisabled(),
                new MessageButton()
                    .setCustomId("cancel")
                    .setLabel("キャンセル")
                    .setStyle("DANGER").setDisabled(),
                new MessageButton()
                    .setCustomId("close")
                    .setLabel("〆")
                    .setStyle("SECONDARY").setDisabled()
            ]
        );
    return buttons;
}