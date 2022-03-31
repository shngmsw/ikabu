const common = require('../common.js');
const rules = {
    0: 'えりあをとるやつ',
    1: 'エレクトリカル・パレード',
    2: 'しゃちほこ',
    3: 'みそしるのみたい',
};

module.exports = function handleRule(msg) {
    // console.log(rules);
    if (msg.content.startsWith('rule stage')) {
        var stage = common.stage2txt(Math.floor(Math.random() * 23).toString());
        var rule = rules[Math.floor(Math.random() * 4)];
        msg.reply('`' + stage + 'で' + rule + '`でし！');
    } else if (msg.content.startsWith('rule')) {
        var rule = rules[Math.floor(Math.random() * 4)];
        msg.reply('`' + rule + '`でし！');
    }
};
