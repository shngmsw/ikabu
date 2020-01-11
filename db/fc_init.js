var sqlite = require('./db.js'),
    db = sqlite.init('./fc.sqlite3');

// init
module.exports.init = function (file) {
    db.serialize(function () {
        var create = new Promise(function (resolve, reject) {
            db.get('select count(*) from sqlite_master where type="table" and name=$name',
                { $name: 'friend_code' }, function (err, res) {
                    var exists = false;
                    if (0 < res['count(*)']) { exists = true; }

                    resolve(exists);
                });
        });

        create.then(function (exists) {
            if (!exists) {
                db.run('create table friend_code (user_id integer primary key, code text)');
            }
        });
    });
};