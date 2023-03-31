export function handlePoll(msg: $TSFixMe) {
    let strCmd = msg.content.replace(/　/g, ' ');
    strCmd = msg.content.replace(/\r?\n/g, ' ');
    const args = strCmd.split(' ');
    args.shift();
    let pollCmd = '/poll " ' + msg.author.username + 'たんのアンケート" ';
    for (let i = 0; i < args.length; i++) {
        pollCmd = pollCmd + '"' + args[i] + '" ';
    }
    msg.channel.send({ content: pollCmd });
}
