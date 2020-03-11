var sqlite = require('./db.js'),
    db = sqlite.init('./fc.sqlite3');

module.exports = {
    getFC: getFC
};

var selectValue = function (condition) {
    return new Promise(function (resolve, reject) {
        db.serialize(() => {
            db.get('select * from friend_code where user_id =' + "'" + condition + "'",
                function (err, res) {
                    if (err) return reject(err);
                    resolve(res);
                });
        });
    });
};

async function getFC(id, msg, name) {
    var condition = { user_id: id };
    var result = "なんかエラーでし。。。";
    return result = await selectValue(id).then(function (result) {
        console.log('Success:', result.code);
        return result.code;
    }).catch(function (err) {
        console.log('Failure:', err);
    });
}
