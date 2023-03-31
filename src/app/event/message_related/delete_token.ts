export async function deleteToken(msg: $TSFixMe) {
    if (msg.content.match('[a-zA-Z0-9_-]{23,28}\\.[a-zA-Z0-9_-]{6,7}\\.[a-zA-Z0-9_-]{27}')) {
        msg.delete({ reason: 'tokenの入った文字列を削除' });

        const channels = await msg.guild.channels.fetch();
        channels.find((channel: $TSFixMe) => channel.name === '精神とテクの部屋').send(`token検出 (author: <@${msg.author.id}>)`);
    }
}
