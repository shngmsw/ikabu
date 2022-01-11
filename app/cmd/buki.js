const request = require("request");
const common = require("./common.js");
const weaponsUrl = "https://stat.ink/api/v2/weapon";

const bukiTypes = {
    シューター: "shooter",
    ブラスター: "blaster",
    シェルター: "brella",
    フデ: "brush",
    チャージャー: "charger",
    マニューバー: "maneuver",
    リールガン: "reelgun",
    ローラー: "roller",
    スロッシャー: "slosher",
    スピナー: "splatling",
};

const weaponTypes = {
    shooter: "shooter",
    blaster: "blaster",
    brella: "brella",
    brush: "brush",
    charger: "charger",
    maneuver: "maneuver",
    reelgun: "reelgun",
    roller: "roller",
    slosher: "slosher",
    splatling: "splatling",
};

module.exports = function handleBuki(command, msg) {
    if (command === "buki") {
        buki(msg);
    } else if (command === "weapon") {
        weapon(msg);
    }
};

function buki(msg) {
    var strCmd = msg.content.replace(/　/g, " ");
    const args = strCmd.split(" ");
    args.shift();

    let amount = 1;
    let bukiType = "";
    let isQuiz = false;

    if (args[0] === "help") {
        let txt =
            "ブキをランダムに抽選します\n\n" +
            "n個のブキをランダムに選びます\n```\nbuki n\n例: buki 3```\n" +
            "ブキを種類縛りでランダムに選びます\n```\nbuki 種類(" +
            Object.keys(bukiTypes).join(`・`) +
            ")\n例: buki シューター```\n";
        message.channel.send({ content: txt });
    } else {
        if (bukiTypes[args[0]]) {
            // e.g. buki シューター
            bukiType = bukiTypes[args[0]];
            amount = 0;
        } else {
            // e.g. buki 8
            amount = Number(args[0]);
        }
        // ブキサブスペクイズ判定
        if (args[0] === "quiz") {
            isQuiz = true;
        }
        request.get(weaponsUrl, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                const weapons = JSON.parse(body);
                let bukis = weapons.filter(function (value) {
                    if (bukiType !== "") {
                        // 特定のbukiTypeが指定されているとき
                        return bukiType === value.type.key;
                    } else if (!~value.name.ja_JP.indexOf("ヒーロー")) {
                        // } else {
                        return true;
                    }
                });
                let bukiNames = bukis.map(function (value) {
                    return {
                        embed: {
                            author: {
                                name: msg.author.username + "のブキ",
                                icon_url: msg.author.avatarURL(),
                            },
                            color: 0xf02d7d,
                            title: value.name.ja_JP,
                            fields: [
                                {
                                    value: value.name.en_US,
                                    name: value.sub.name.ja_JP + " / " + value.special.name.ja_JP,
                                },
                            ],
                        },
                    };
                });
                console.log(amount);
                if (amount) {
                    // var buki = random(size, amount).join('\n');
                    var length = bukiNames.length;
                    for (let i = 0; i < amount; i++) {
                        msg.channel.send({
                            embeds: [bukiNames[Math.floor(Math.random() * length)]],
                        });
                    }
                } else if (isQuiz) {
                    // var buki = random(bukiNames, 1)[0];
                    // console.log(amount);
                    // msg.reply(buki.replace('(', '(||').replace(')', '||)'));
                } else {
                    var buki = common.random(bukiNames, 1)[0];
                    msg.channel.send({ embeds: [buki] });
                }
            } else {
                msg.channel.send("なんかエラーでてるわ");
            }
        });
    }
}

function weapon(msg) {
    var strCmd = msg.content.replace(/　/g, " ");
    const args = strCmd.split(" ");
    args.shift();

    let amount = 1;
    let bukiType = "";
    let isQuiz = false;

    if (args[0] === "help") {
        let txt =
            "Choose a weapon randomly\n```weapon```" +
            "Choose N weapons randomly\n```weapon n\ne.g. weapon 3```\n" +
            "Specify a type and choose at random\n```\nweapon type(" +
            Object.values(weaponTypes).join(`・`) +
            ")\ne.g. weapon shooter```\n";
        message.channel.send({ content: txt });
    } else {
        if (weaponTypes[args[0]]) {
            // e.g. buki シューター
            bukiType = weaponTypes[args[0]];
            amount = 0;
        } else {
            // e.g. buki 8
            amount = Number(args[0]);
            if (amount > 10) {
                amount = 10;
                msg.channel.send("Up to 10 items can be output at a time");
            }
        }
        // ブキサブスペクイズ判定
        if (args[0] === "quiz") {
            isQuiz = true;
        }
        request.get(weaponsUrl, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                const weapons = JSON.parse(body);
                let bukis = weapons.filter(function (value) {
                    if (bukiType !== "") {
                        // 特定のbukiTypeが指定されているとき
                        return bukiType === value.type.key;
                    } else {
                        return true;
                    }
                });
                let bukiNames = bukis.map(function (value) {
                    return {
                        embed: {
                            author: {
                                name: msg.author.username + "'s weapon",
                                icon_url: msg.author.avatarURL(),
                            },
                            color: 0xf02d7d,
                            fields: [
                                {
                                    name: value.name.en_US,
                                    value:
                                        value.sub.name.en_US + " / " + value.special.name.en_US,
                                },
                                // { name: "Sub", value: value.sub.name.ja_JP, inline: true },
                                // { name: "Special", value: value.special.name.ja_JP, inline: true }
                            ],
                        },
                    };
                });
                if (amount) {
                    // var buki = random(size, amount).join('\n');
                    var length = bukiNames.length;
                    for (let i = 0; i < amount; i++) {
                        msg.channel.send({
                            embeds: bukiNames[Math.floor(Math.random() * length)],
                        });
                    }
                } else if (isQuiz) {
                    // var buki = random(bukiNames, 1)[0];
                    // console.log(amount);
                    // msg.reply(buki.replace('(', '(||').replace(')', '||)'));
                } else {
                    var buki = common.random(bukiNames, 1)[0];
                    msg.channel.send({ embeds: [buki] });
                }
            } else {
                msg.channel.send("なんかエラーでてるわ");
            }
        });
    }
}
