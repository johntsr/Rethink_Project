var r               = require('rethinkdb');
var w 				= require("../operations/index.js");
var config 			= require('../../../config');
var calls 			= require("../../callbacks.js");
var profile 		= require("./profile.js");

var model 			= module.exports;
model.setup 		= setup;

function setup(io) {
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
                r.table(config.tables.wiki).limit(1).run(conn, function(error, cursor) {
                    var promise;
                    if (error) {
                        console.log("Creating table...");
                        promise = r.tableCreate(config.tables.wiki).run(conn);
                    } else {
                        promise = cursor.toArray();
                    }

                    // The table exists, setup the update listener
                    promise.then(function(result) {
                        console.log("Setting up update listener...");

                        r.table(config.tables.filters).run(conn).then(function(cursor) {
                            cursor.toArray(function(error, filters) {
                                for(var i = 0; i < filters.length; i++){
                                    profile.listenFilter( filters[i] );
                                }
                            });
                        }).error(calls.throwError);

                        r.table(config.tables.filters).changes().run(conn).then(function(cursor) {
                            cursor.each(function(error, row) {
    							var filterInfoData = row.new_val;
    							var userID;
                                var _id;
    							var _title;
                                if(filterInfoData){
    	                            profile.listenFilter(filterInfoData);
                                    _id = filterInfoData.id;
    								userID = filterInfoData.userID;
    								_title = filterInfoData.filterTitle;
									_table = filterInfoData.table;
    								io.emit('newFilter_' + userID, { id: _id, filterTitle: _title, table: _table});
                                }
    							else{
                                    filterInfoData = row.old_val;
                                    _id = filterInfoData.id;
    								userID = filterInfoData.userID;
                                    _title = filterInfoData.filterTitle;
									_table = filterInfoData.table;
    								io.emit('deleteFilter_' + userID, {id: _id, filterTitle: _title, table: _table});
    							}
                            });
                        }).error(calls.throwError);

                        r.table(config.tables.broadcast).changes().run(conn).then(function(cursor) {
                        // r.table(config.tables.broadcast).changes({squash: 1.0}).run(conn).then(function(cursor) {
                            cursor.each(function(error, row) {
    							var broadcastData = row.new_val;
                                if(broadcastData){
    								var data = {filterTitle: broadcastData.filterInfoData.filterTitle,
    											data: broadcastData.broadcastData};
    								// NOTE: id[0]!
                                    io.emit(broadcastData.emit + broadcastData.id[0], data);
									w.Connect(new w.DeleteByKey(config.tables.broadcast, broadcastData.id), conn);
                                }
                            });
                        }).error(calls.throwError);
                    }).error(calls.throwError);
                });
            });
        }
    );
}
