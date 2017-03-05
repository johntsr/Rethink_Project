var r = require('rethinkdb');
var config = require('../config');

var MOVIES_TABLE = config.movieTable;


r.connect(config.database).then(function(conn) {
    movie = {title: "Lego", likes:111, unlikes:111};
    r.table(MOVIES_TABLE).insert(movie).run(conn).then(function(results) {
        conn.close(function(err) { if (err) throw err; });
    })
    .error(function(error) {
        throw error;
    });
}).error(function(error) {
    throw error;
});
