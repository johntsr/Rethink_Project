var model = module.exports;
var calls = require("./callbacks.js");
var r = require('rethinkdb');
var config = require('../config');

var TABLE = config.table;

model.setup = function (callback) {
console.log("Setting up RethinkDB...");

r.connect(config.database).then(function(conn) {
    // Does the database exist?
    r.dbCreate(config.database.db).run(conn).then(function(result) {
        console.log("Database created...");
    }).error(function(error) {
        console.log("Database already created...");
    }).finally(function() {
        // Does the table exist?
        r.table(TABLE).limit(1).run(conn, function(error, cursor) {
            var promise;
            if (error) {
                console.log("Creating table...");
                promise = r.tableCreate(TABLE).run(conn);
            } else {
                promise = cursor.toArray();
            }

            // The table exists, setup the update listener
            promise.then(function(result) {
                console.log("Setting up update listener...");
                r.table(TABLE).changes().run(conn).then(function(cursor) {
                    cursor.each(function(error, row) {
                        callback(row);
                    });
                });
            }).error(calls.throwError);
        });
    });
}).error(calls.throwError);
};

model.getPosts = function (callback) {
r.connect(config.database).then(function(conn) {
    r.table(TABLE).run(conn).then(function(cursor) {
        cursor.toArray(function(error, results) {
            if (error) throw error;
            callback(results);
        });
    }).error(calls.throwError);
}).error(calls.throwError);
};

model.savePost = function (wikipost, callback) {
r.connect(config.database).then(function(conn) {
    r.table(TABLE).insert(wikipost).run(conn).then(function(results) {
        callback(true, results);
    }).error(function(error) {
        callback(false, error);
    });
}).error(function(error) {
    callback(false, error);
});
};

model.deletePost = function (wikipost, callback) {
r.connect(config.database).then(function(conn) {
    r.table(TABLE).get(wikipost).delete().run(conn).then(function(results) {
       callback(true, results);
    }).error(function(error) {
        callback(false, error);
    });
}).error(function(error) {
    callback(false, error);
});
};


model.listenFilter = function (wikipostFilter, callback) {
r.connect(config.database).then(function(conn) {
    r.table(TABLE).filter( wikipostFilter ).run(conn).then(function(results) {
       callback(true, results);
    }).error(function(error) {
        callback(false, error);
    });
}).error(function(error) {
    callback(false, error);
});
};
