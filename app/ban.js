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
        const user = await msg.mentions.members.first();
        let id = args[0];
        console.log(id);
        if (args[1]) {
            let reason =
                "イカ部の管理人です。以下の理由によりイカ部から退部とさせていただきました。```" +
                args[1] +
                "```" +
                "申し訳ありませんが、質問等は受け付けておりませんので、よろしくお願いいたします。";

            user.createDM().then(DMChannel => {
                // We have now a channel ready.
                // Send the message.
                DMChannel.send(reason).then(async () => {
                    // Message sent, time to kick.
                    const banmember = await msg.guild.ban(user.id, reason);
                    console.log(banmember);
                    msg.guild.channels
                        .find("name", "banコマンド")
                        .send(
                            `${banmember.username}さんを以下の理由によりBANしました。\n` +
                            reason
                        );
                });
            });
        } else {
            return msg.channel.send("理由を入れるでし！");
        }
    } else {
        return msg.channel.send("BANする権限がないでし！");
    }
}
