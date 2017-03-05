var calls = require("../models/callbacks.js")
var r = require('rethinkdb');

var config = {
  database: {
    db: process.env.RDB_DB || "test",
    host: process.env.RDB_HOST || "localhost",
    port: process.env.RDB_PORT || 28015,
    user: "admin",
    password: "SKATEBOARD"
  },

  table: "lala",

  port: process.env.APP_PORT || 3000
};


r.connect(config.database).then( function(conn) {
    r.table(config.table).insert( {lala:"popo"} ).run(conn).then(function(results) {
        console.log(results);
		conn.close( calls.throwErrorCond );
    }).error(calls.throwError)
}).error(calls.throwError);
