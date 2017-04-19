/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/* jshint node: true */
'use strict';
var model = module.exports;
var calls = require("./callbacks.js");
var broadcast = require("./wikibroadcast.js");
var w = require("./rethinkwrap.js");
var r = require('rethinkdb');
var fparser = require('./filterparser.js');
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
                                var _id;
    							var _title;
                                if(filterInfoData){
    	                            model.listenFilter(filterInfoData);
                                    _id = filterInfoData.id;
    								userID = filterInfoData.userID;
    								_title = filterInfoData.filterTitle;
    								io.emit('newFilter_' + userID, { id: _id, filterTitle: _title});
                                }
    							else{
                                    filterInfoData = row.old_val;
                                    _id = filterInfoData.id;
    								userID = filterInfoData.userID;
                                    _title = filterInfoData.filterTitle;
    								io.emit('deleteFilter_' + userID, {id: _id, filterTitle: _title});
    							}
                            });
                        }).error(calls.throwError);

                        r.table(config.broadcast).changes().run(conn).then(function(cursor) {
                        // r.table(config.broadcast).changes({squash: 1.0}).run(conn).then(function(cursor) {
                            cursor.each(function(error, row) {
    							var wikiBroadcastData = row.new_val;
                                if(wikiBroadcastData){
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
	var GetSeconds = 5;
	var timestamp = Math.floor(new Date() / 1000) - GetSeconds;
    var filter = fparser.AndExpressions([{name:'timestamp', value:timestamp, op:'<'}]).toNoSQLQuery();
    w.Connect(
        new w.GetByFilter(config.wiki, fparser.rethinkFilter(filter), function(cursor) {w.cursorToArray(cursor, callback);} )
    );
};

model.addFilter = function (filterInfo, callback) {
    w.connect(
        function(conn) {
			var filter = fparser.AndExpressions([{name:'userID', value:filterInfo.userID()},
		                                        {name:'table', value:filterInfo.table()},
												{name:'query', value:filterInfo.query()},
												{name:'filterTitle', value:filterInfo.filterTitle()}]).toNoSQLQuery();
            r.table(config.filters).filter( fparser.rethinkFilter(filter) ).isEmpty().run(conn).then(
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

model.deleteFilter = function (filterID, callback) {
	console.log("Delete filter: " + filterID);
    w.Connect( new w.DeleteByKey(config.filters, filterID) );
};

model.getFilters = function (userID, table, callback) {
    var filter = fparser.AndExpressions([{name:'userID', value:userID},
                                        {name:'table', value:table}]).toNoSQLQuery();
    w.Connect(
        new w.GetByFilter(config.filters, fparser.rethinkFilter(filter),  function (cursor){w.cursorToArray(cursor, callback);} )
    );
};

model.listenFilter = function (filterInfoData) {
    var endOfDay = false;
    w.connect(
        function(conn) {
            var filter = fparser.AndExpressions([{name:'userID', value:filterInfoData.userID},
                                    {name:'table', value:filterInfoData.table},
                                    {name:'query', value:filterInfoData.query},
                                    {name:'filterTitle', value:filterInfoData.filterTitle}]).toNoSQLQuery();
    		r.table(config.filters).filter( fparser.rethinkFilter(filter) ).changes().run(conn).then(
    			function(cursor){
                    cursor.each(function(error, rowChange) {
                        if(!rowChange.new_val){
                            endOfDay = true;
                            cursor.close();
                            return false;
                        }
         			});
    			}).error(calls.throwError);
            r.table(filterInfoData.table).filter( fparser.rethinkFilter(filterInfoData.query) ).changes().run(conn).then(function(cursor) {
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
    w.Connect( new w.Insert(config.broadcast, wikiBroadcast.getData()) );
};

model.getUserByID = function (userID, callback) {
    w.Connect( new w.GetByKey(config.users, userID,
        function (user){ callback(null, user); },
        function (error){ callback(error); })
    );
};



model.getUserByCredentials = function (username, password, callback) {
    var filter = fparser.AndExpressions([{name:'username', value:fparser.htmlSpecialChars(username)},
                                        {name:'password', value:fparser.htmlSpecialChars(password)}]).toNoSQLQuery();
    w.Connect(
        new w.GetByFilter(config.users, fparser.rethinkFilter(filter),
            function (cursor){ w.cursorToField(cursor, callback); },
            function (error){ callback(error); })
    );
};

model.signIn = function (_username, _password, callback){
    model.getUserByCredentials(_username, _password,
        function (error, user){
            if(!error && !user){
                w.Connect( new w.Insert(config.users, {username: fparser.htmlSpecialChars(_username), password: fparser.htmlSpecialChars(_password)}) );
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

    var filter = fparser.FilterParser([{name: 'userID', value: userID}]).toNoSQLQuery();
    w.Connect( new w.DeleteByFilter(config.filters, fparser.rethinkFilter(filter)) );
};
