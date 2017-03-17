var model = module.exports;
var calls = require("./callbacks.js");
var broadcast = require("./wikibroadcast.js");
var w = require("./rethinkwrap.js");
var r = require('rethinkdb');
var fparser = require('./filterparser');
var config = require('../config');


model.setup = function (io) {
    console.log("Setting up RethinkDB...");
    w.connect(
        function(conn) {
            // Does the database exist?
            r.dbCreate(config.database.db).run(conn).then(function(result) {
                console.log("Database created...");
            }).error(function(error) {
                console.log("Database already created...");
            }).finally(function() {
                // Does the table exist?
                r.table(config.wiki).limit(1).run(conn, function(error, cursor) {
                    var promise;
                    if (error) {
                        console.log("Creating table...");
                        promise = r.tableCreate(config.wiki).run(conn);
                    } else {
                        promise = cursor.toArray();
                    }

                    // The table exists, setup the update listener
                    promise.then(function(result) {
                        console.log("Setting up update listener...");

                        r.table(config.filters).run(conn).then(function(cursor) {
                            cursor.toArray(function(error, filters) {
                                for(var i = 0; i < filters.length; i++){
                                    model.listenFilter( filters[i] );
                                }
                            });
                        }).error(calls.throwError);

                        r.table(config.filters).changes().run(conn).then(function(cursor) {
                            cursor.each(function(error, row) {
    							var filterInfoData = row.new_val;
    							var userID;
    							var _title;
                                if(filterInfoData){
    	                            model.listenFilter(filterInfoData);
    								userID = filterInfoData.userID;
    								_title = filterInfoData.filterTitle;
    								io.emit('newFilter_' + userID, {filterTitle: _title});
                                }
    							else{
    								filterInfoData = row.old_val;
    								userID = filterInfoData.userID;
    								_title = filterInfoData.filterTitle;
    								io.emit('deleteFilter_' + userID, {filterTitle: _title});
    							}
                            });
                        }).error(calls.throwError);

                        r.table(config.broadcast).changes().run(conn).then(function(cursor) {
                        // r.table(config.broadcast).changes({squash: 1.0}).run(conn).then(function(cursor) {
                            cursor.each(function(error, row) {
    							var wikiBroadcastData = row.new_val;
                                if(wikiBroadcastData){
                                    console.log("Send it finally!");
    								var data = {filterTitle: wikiBroadcastData.filterInfoData.filterTitle,
    											wikiData: wikiBroadcastData.broadcastData};
    								// NOTE: id[0]!
                                    io.emit(wikiBroadcastData.emit + wikiBroadcastData.id[0], data);
									w.Connect(new w.DeleteByKey(config.broadcast, wikiBroadcastData.id), conn);
                                }
                            });
                        }).error(calls.throwError);
                    }).error(calls.throwError);
                });
            });
        }
    );
};

model.getPosts = function (callback) {
    w.Connect(
        new w.GetByFilter(config.wiki, 'true', function(cursor) {w.cursorToArray(cursor, callback);} )
    );
};

model.savePost = function (wikipost) {
    w.Connect( new w.Insert(config.wiki, wikipost, calls.print("Done save post!")) );
};

model.deletePost = function (wikipost) {
    w.Connect( new w.DeleteByKey(config.wiki, wikipost, calls.print("Done delete post!")) );
};

//NOTE
model.addFilter = function (filterInfo, callback) {
    w.connect(
        function(conn) {
            r.table(config.filters).filter(
    			r.row('userID').eq(filterInfo.userID())
    			.and(r.row('table').eq(filterInfo.table()))
    			.and( r.row('query').eq(filterInfo.query())
    					.or(r.row('filterTitle').eq(filterInfo.filterTitle()) )
    				)
    		).isEmpty()
    		.run(conn).then(
    			function(empty){
    				if( empty ){
                        w.Connect(
                            new w.Insert(config.filters, filterInfo.getData(), {returnChanges: true},
                                function(data){
                                    callback(data.inserted > 0);
                                }
                        ), conn, true);
    				}
    				else{
                        w.close(conn);
    					callback(false);
    				}
    			}
    		).error(calls.throwError);
        }
    );
};

model.deleteFilter = function (userID, table, filterTitle, callback) {
    var filter = new fparser.AndFilter([{name:'filterTitle', value:filterTitle},
                                        {name:'userID', value:userID},
                                        {name:'table', value:table}]).toNoSQLQuery();
    w.Connect( new w.DeleteByFilter(config.filters, filter) );
};

model.getFilters = function (userID, table, callback) {
    var filter = new fparser.AndFilter([{name:'userID', value:userID},
                                        {name:'table', value:table}]).toNoSQLQuery();
    w.Connect(
        new w.GetByFilter(config.filters, filter,  function (cursor){w.cursorToArray(cursor, callback);} )
    );
};

//NOTE
model.listenFilter = function (filterInfoData) {
    var endOfDay = false;
    w.connect(
        function(conn) {
    		r.table(config.filters).filter(
    			r.row('userID').eq(filterInfoData.userID)
    			.and(r.row('table').eq(filterInfoData.table))
    			.and( r.row('query').eq(filterInfoData.query)
    					.or(r.row('filterTitle').eq(filterInfoData.filterTitle) )
    				)
    		).changes()
    		.run(conn).then(
    			function(cursor){
                    cursor.each(function(error, rowChange) {
                        console.log("Check for deletion!");
                        if(!rowChange.new_val){
                            endOfDay = true;
                            cursor.close();
                            return false;
                        }
         			});
    			}).error(calls.throwError);
            r.table(filterInfoData.table).filter( eval(filterInfoData.query) ).changes().run(conn).then(function(cursor) {
               cursor.each(function(error, rowChange) {
                   if(endOfDay){
                       cursor.close();
                       conn.close();
                       return false;
                   }
    			   model.prepareBroadcast(new broadcast.WikiBroadcast(filterInfoData, rowChange) );
    			});
        	}).error(calls.throwError);
    	}
    );
};

model.prepareBroadcast = function (wikiBroadcast) {
    calls.print("Found broadcast!");
    w.Connect( new w.Insert(config.broadcast, wikiBroadcast.getData(), calls.print("broadcast ready!")) );
};

model.getUserByID = function (userID, callback) {
    w.Connect( new w.GetByKey(config.users, userID,
        function (user){ callback(null, user); },
        function (error){ callback(error); })
    );
};

model.getUserByCredentials = function (username, password, callback) {
    var filter = new fparser.AndFilter([{name:'username', value:username},
                                        {name:'password', value:password}]).toNoSQLQuery();
    w.Connect(
        new w.GetByFilter(config.users, filter,
            function (cursor){ w.cursorToField(cursor, callback); },
            function (error){ callback(error); })
    );
};

model.signIn = function (_username, _password, callback){
    model.getUserByCredentials(_username, _password,
        function (error, user){
            if(!error && !user){
                w.Connect( new w.Insert(config.users, {username: _username, password: _password}) );
                callback(true);
            }
            else{
                callback(false);
            }
        }
    );

};

model.signOut = function (userID){
    w.Connect( new w.DeleteByKey(config.users, userID) );

    var filter = new fparser.FilterParser({name: 'userID'}).eqValue(userID);
    w.Connect( new w.DeleteByFilter(config.filters, filter) );
};
