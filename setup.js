var r 				= require('rethinkdb');
var w         = require("./models/database/operations/index.js");
var sources   = require("./models/datasources/index.js");
var auth 	    = require('./models/database/routingcalls/auth.js');
var config    = require("./config.js");

// create the db
w.Connect(
  new w.CreateDB(config.database.db, function (data){
    w.Connect(
      new w.CreateTable(config.tables.broadcast)
    );
    w.Connect(
      new w.CreateTable(config.tables.filters)
    );
    w.Connect(
      new w.CreateTable(config.tables.users, {},
        function(data) {
          auth.signIn('test-user', 'test-user',
              function(_success){
                  console.log('Successful user creation.');
              }
          );
        }
      )
    );
    w.Connect(
      new w.CreateTable(config.tables.sources, {},
        function(data) {
          sources.addTable('Wiki',
            [
              {name: "bot" , type: "boolean", message: "Check if bots are welcome"} ,
              {name: "type", type: "multiple", message: "Check the type(s) of posts you are interested in",
                        choices: ["new", "edit", "log", "categorize", "external"]},
              {name: "title" , type: "string", message: "Match string in post title"}
            ]
          );
        })
    );
  })
);
