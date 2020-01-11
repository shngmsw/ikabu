var sqlite = require('./db.js'),
    fc_init = require('./fc_init.js'),
    db = sqlite.init('./fc.sqlite3');

module.exports = {
    insert: insert
};

function insert(id, code) {
    console.log("insert:" + id + "/" + code);
    db.serialize(() => {
        // テーブルがなければ作る
        fc_init.init();
        console.log("insert:" + code);
        // or replace は PK重複したら対象業を削除して登録
        db.run('insert or replace into friend_code (user_id, code) values ($i, $c)',
            {
                $i: id,
                $c: code
            }
        );
    });
}

