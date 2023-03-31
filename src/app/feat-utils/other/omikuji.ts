const kujis = ['大吉', '中吉', '小吉', '吉', '凶', '大凶', '末吉'];
export function handleOmikuji(msg: $TSFixMe) {
    const kuji = kujis[Math.floor(Math.random() * kujis.length)];
    msg.reply('`' + kuji + '`でし！');
}
