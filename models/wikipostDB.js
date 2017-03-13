var model = module.exports;
var calls = require("./callbacks.js");
var r = require('rethinkdb');
var config = require('../config');


function WikiBroadcast(_userID, _filterInfoData, _wikiPostChange){
	this.data = {};
	this.data.filterInfoData = _filterInfoData;
	this.data.emit = '';
	this.data.broadcastData = {};
	this.data.id = [];

	if ((_wikiPostChange.new_val !== null) && (_wikiPostChange.old_val !== null)) {           // update
		this.data.emit = 'update_';
		this.data.broadcastData = _wikiPostChange.new_val;
	} else if ((_wikiPostChange.new_val !== null) && (_wikiPostChange.old_val === null)) {    // new wikipost
		this.data.emit = 'new_';
		this.data.broadcastData = _wikiPostChange.new_val;
	} else if ((_wikiPostChange.new_val === null) && (_wikiPostChange.old_val !== null)) {    // deleted wikipost
		this.data.emit = 'delete_';
		this.data.broadcastData = _wikiPostChange.old_val;
	}
	this.data.id = [_userID, this.data.broadcastData.id];
}

WikiBroadcast.prototype.getData = function(){
	return this.data;
};


model.setup = function (io, callback) {
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

                    r.table(config.users).run(conn).then(function(cursor) {
                        cursor.toArray(function(error, results) {
                            for(var user = 0; user < results.length; user++){
                                var filters = results[user].filters;
                                var userID = results[user].id;
								for(var i = 0; i < filters.length; i++){
                                    model.listenFilter( userID, filters[i], callback );
                                }
                            }
                        });
                    });

                    r.table(config.users).changes().run(conn).then(function(cursor) {
                        cursor.each(function(error, row) {
							var user = row.new_val;
                            if(user){
								console.log(user);
	                            var filters = user.filters;
	                            var userID = user.id;
	                            for(var i = 0; i < filters.length; i++){
	                                model.listenFilter( userID, filters[i], callback );
								}
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

// TODO
model.addFilter = function (userID, filterInfo, callback) {
    r.connect(config.database).then(function(conn) {
        r.table(config.users).get(userID).update(
			function(user){
  				return r.branch(
		            user('filters').contains(
		            	function(filterRecord) {
    				 		return filterRecord('filterTitle').eq( filterInfo.filterTitle() )
									.or(filterRecord('query').eq( filterInfo.query() ));
   						}).not(),
		            {'filters': user('filters').append( filterInfo.setTable(config.wiki).getData() )},
		            null
	  			);
  			}, {returnChanges: true} )
        	.run(conn).then(
			function(data){
				callback(data.unchanged === 0);
			}
		).error(calls.throwError);
    }).error(calls.noFun);
};

model.deleteFilter = function (userID, filterTitle, callback) {
    r.connect(config.database).then(function(conn) {
        r.table(config.users).get(userID).update(
			function(user){
				return {
				'filters': user('filters').filter(
					function (item) {
						return item('filterTitle').ne(filterTitle);
					})
				};
  			}).run(conn).then(calls.noFun).error(calls.noFun);
    }).error(calls.noFun);
};

model.listenFilter = function (userID, filterInfoData, callback) {
    r.connect(config.database).then(function(conn) {
        r.table(filterInfoData.table).filter( filterInfoData.query ).changes().run(conn).then(function(cursor) {
           cursor.each(function(error, rowChange) {
               model.prepareBroadcast(new WikiBroadcast(userID, filterInfoData, rowChange) );
           });
        }).error(calls.noFun);
    }).error(calls.noFun);
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
