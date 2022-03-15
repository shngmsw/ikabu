const specialweapons = {
    0: 'ジェット噴射でとびまわれ',
    1: 'あんな勢いで下に降りて足は痛くないのか',
    2: '10発敵にぶちかます',
    3: '高圧洗浄機',
    4: 'ついに人類（？）は人工雨を降らせることに成功してしまった',
    5: 'あんな物騒なもの投げまくるなんて',
    6: 'インクをみにまとえ',
    7: 'とっとこ走るよハ○太郎',
    8: 'しゃぼんだま',
    9: 'げんきだま',
    10: '捺印する',
};

module.exports = function handleSpecial(msg) {
    var special = specialweapons[Math.floor(Math.random() * 10)];
    msg.reply('`' + special + '`でし！');
};
