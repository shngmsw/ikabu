const subweapons = {
    0: 'おにぎり',
    1: 'くっつくばくだん',
    2: 'みずふうせん',
    3: '勝手にお水やってくれるやつ',
    4: '前線にすぐに戻れるよ君',
    5: '滝を作る道具',
    6: '位置がまるバレ君',
    7: '罠',
    8: 'ヤー！ヤー！ヤー！',
    9: '勝手についてってくれるやつ',
    10: '毒霧',
    11: 'ふればふるほどつよくなる',
    12: '勝手についてってくれるやつMKⅡ',
};

module.exports = function handleSub(msg) {
    var sub = subweapons[Math.floor(Math.random() * 12)];
    msg.reply('`' + sub + '`でし！');
};
