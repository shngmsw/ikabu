module.exports = async function handleBan(msg) {
    if (msg.member.hasPermission("BAN_MEMBERS")) {
        console.log(msg.mentions.members.size);
        if (msg.mentions.members.size < 1) {
            return msg.channel.send("BANするメンバーを1人指定してください");
        }

        var strCmd = msg.content.replace(/　/g, " ");
        strCmd = strCmd.replace("\x20+", " ");
        const args = strCmd.split(" ");
        args.shift();
        const member = await msg.mentions.members.first();
        let id = args[0];
        console.log(id);
        if (args[1]) {
            let reasonText =
                "イカ部の管理人です。以下の理由によりイカ部から退部とさせていただきました。```" +
                args[1] +
                "```" +
                "申し訳ありませんが、質問等は受け付けておりませんので、よろしくお願いいたします。";

            let DMChannel = await member.createDM();
            await DMChannel.send(reasonText).catch(console.error);

            await member.ban({ reason: reasonText }).catch(console.error);

            const banChannel = msg.guild.channels.cache.find(channel => channel.name === "banコマンド")
            banChannel.send(
                `${member.user.tag}さんを以下の理由によりBANしました。\n` +
                reasonText
            );
        } else {
            return msg.channel.send("理由を入れるでし！");
        }
    } else {
        return msg.channel.send("BANする権限がないでし！");
    }
}
