const Discord = require("discord.js");
const client = new Discord.Client({ intents: 0, partials: ["GUILD_MEMBER", "USER"] });
module.exports = {
    join: join,
    cancel: cancel,
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
    const support =
        guild.channels.cache.find(
            (channel) => channel.id === process.env.CHANNEL_ID_SUPPORT
        )
    interaction.followUp(`参加表明に失敗しました。\n ${support}に連絡してください。`).catch(() => { });
    throw err;
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
        interaction.channel.send({ content: `${host_mention}\n${member_mention}たんが参加表明したでし！` })
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
    await interaction.deferReply({
        ephemeral: true
    });

    try {
        const msg_id = params.get("mid");
        const cmd_message = await interaction.channel.messages.fetch(msg_id);
        const host_mention = `<@${cmd_message.author.id}>`;
        await interaction.followUp({
            content: `キャンセルするときぐらい、自分の言葉で伝えましょう！\n${host_mention}たんにメンションつきで伝えるでし！`
        });
    } catch (err) {
        handleError(err, { interaction })
    }
}
