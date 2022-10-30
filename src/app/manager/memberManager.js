module.exports = {
    searchMemberById: searchMemberById,
};

/**
 * ユーザーIDからメンバーを検索する．ない場合はnullを返す．
 * @param {Guild} guild Guildオブジェクト
 * @param {string} roleId ユーザーID
 * @returns メンバーオブジェクト
 */
async function searchMemberById(guild, userId) {
    // APIからのメンバーオブジェクト(discord.jsのGuildMemberでないもの)がそのまま渡ってくることがあるのでfetchすることで確実にGuildMemberとする。
    const members = await guild.members.fetch();
    let member = members.find((member) => member.id === userId);

    return member;
}
