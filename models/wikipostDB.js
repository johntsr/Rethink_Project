var model = module.exports;
var calls = require("./callbacks.js");
var r = require('rethinkdb');
var config = require('../config');


function WikiBroadcast(_filterInfoData, _wikiPostChange){
	this.data = {};
	this.data.filterInfoData = _filterInfoData;
	this.data.emit = '';
	this.data.broadcastData = {};
	this.data.id = [];

	if ((_wikiPostChange.new_val !== null) && (_wikiPostChange.old_val !== null)) {           // update
		this.data.emit = 'updateWiki_';
		this.data.broadcastData = _wikiPostChange.new_val;
	} else if ((_wikiPostChange.new_val !== null) && (_wikiPostChange.old_val === null)) {    // new wikipost
		this.data.emit = 'newWiki_';
		this.data.broadcastData = _wikiPostChange.new_val;
	} else if ((_wikiPostChange.new_val === null) && (_wikiPostChange.old_val !== null)) {    // deleted wikipost
		this.data.emit = 'deleteWiki_';
		this.data.broadcastData = _wikiPostChange.old_val;
	}
	this.data.id = [_filterInfoData.userID, this.data.broadcastData.id];
}

WikiBroadcast.prototype.getData = function(){
	return this.data;
};


model.setup = function (io) {
    console.log("Setting up RethinkDB...");

    r.connect(config.database).then(function(conn) {
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
                    });

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
                    });

                    r.table(config.broadcast).changes({squash: 1.0}).run(conn).then(function(cursor) {
                        cursor.each(function(error, row) {
							var wikiBroadcastData = row.new_val;
                            if(wikiBroadcastData){
								var data = {filterTitle: wikiBroadcastData.filterInfoData.filterTitle,
											wikiData: wikiBroadcastData.broadcastData};
								// NOTE: id[0]!
                                io.emit(wikiBroadcastData.emit + wikiBroadcastData.id[0], data);
                                r.table(config.broadcast).get(wikiBroadcastData.id).delete().run(conn);
                            }
                        });
                    });

                }).error(calls.throwError);
            });
        });
    }).error(calls.throwError);
};

model.getPosts = function (callback) {
    r.connect(config.database).then(function(conn) {
	    r.table(config.wiki).run(conn).then(function(cursor) {
	        cursor.toArray(function(error, results) {
	            if (error) throw error;
	            callback(results);
	        });
	    }).error(calls.throwError);
	}).error(calls.throwError);
};

model.savePost = function (wikipost, callback) {
    r.connect(config.database).then(function(conn) {
    r.table(config.wiki).insert(wikipost).run(conn).then(calls.NoFun).error(calls.NoFun);
    }).error(calls.NoFun);
};

model.deletePost = function (wikipost, callback) {
    r.connect(config.database).then(function(conn) {
        r.table(config.wiki).get(wikipost).delete().run(conn).then(function(results) {
           callback(true, results);
        }).error(function(error) {
            callback(false, error);
        });
    }).error(function(error) {
	    callback(false, error);
	});
};

model.addFilter = function (filterInfo, callback) {
    r.connect(config.database).then(function(conn) {
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
					r.table(config.filters).insert({
						filterTitle: filterInfo.filterTitle(),
						query: filterInfo.query(),
						table: filterInfo.table(),
						userID: filterInfo.userID(),
					}, {returnChanges: true} ).run(conn).then(
						function(data){
							callback(data.inserted > 0);
						});
				}
				else{
					callback(false);
				}
			}
		).error(calls.throwError);
    }).error(calls.noFun);
};

model.deleteFilter = function (userID, table, filterTitle, callback) {
	console.log(table);
	console.log(filterTitle);
    r.connect(config.database).then(function(conn) {
		r.table(config.filters).filter(
			r.row('filterTitle').eq(filterTitle)
			.and(r.row('userID').eq(userID))
			.and(r.row('table').eq(table))
		).delete()
		.run(conn).then(calls.noFun).error(calls.noFun);
    }).error(calls.noFun);
};

model.getFilters = function (userID, table, callback) {
    r.connect(config.database).then(function(conn) {
		r.table(config.filters).filter(
			r.row('userID').eq(userID)
			.and(r.row('table').eq(table))
		).run(conn).then(function(cursor) {
	        cursor.toArray(function(error, results) {
	            if (error) throw error;
	            callback(results);
	        });
	    }).error(calls.noFun);
    }).error(calls.noFun);
};

model.listenFilter = function (filterInfoData) {
    r.connect(config.database).then(function(conn) {
		r.table(config.filters).filter(
			r.row('userID').eq(filterInfoData.userID)
			.and(r.row('table').eq(filterInfoData.table))
			.and( r.row('query').eq(filterInfoData.query)
					.or(r.row('filterTitle').eq(filterInfoData.filterTitle) )
				)
		).changes().isEmpty()
		.run(conn).then(
			function(empty){
				if(empty){
					conn.close();
				}
			});
        r.table(filterInfoData.table).filter( filterInfoData.query ).changes().run(conn).then(function(cursor) {
           cursor.each(function(error, rowChange) {
			   	model.prepareBroadcast(new WikiBroadcast(filterInfoData, rowChange) );
			});
    	}).error(calls.noFun);
	})
	.error(calls.noFun);
};

model.prepareBroadcast = function (wikiBroadcast) {
    r.connect(config.database).then(function(conn) {
        r.table(config.broadcast).insert(wikiBroadcast.getData()).run(conn);
    }).error(calls.noFun);
};

model.getUserByID = function (userID, callback) {
    r.connect(config.database).then(function(conn) {
        r.table(config.users).get(userID).run(conn).then(function(user) {
    		callback(null, user);
        }).error(function(error) {
            callback(error);
        });
    }).error(function(error) {
        callback(error);
    });
};

model.getUserByCredentials = function (username, password, callback) {
    r.connect(config.database).then(function(conn) {
        r.table(config.users).filter(
            r.row('username').eq(username).and(r.row('password').eq(password))
        ).limit(1).run(conn).then(function(cursor) {
    		 cursor.toArray(function(err, results) {
                if(results.length > 0){
                    callback(false, results[0]);
                }
                else{
                    callback(false, null);
                }
            });
        }).error(function(error) {
            callback(error);
        });
    }).error(function(error) {
        callback(error);
    });
};
