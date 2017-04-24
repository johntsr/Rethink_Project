var r               = require('rethinkdb');
var w 				= require("../operations/index.js");
var fparser 		= require('../../filterparser/index.js');
var config 			= require('../../../config');
var calls 			= require("../../callbacks.js");
var emittypes 		= require("./emittypes/index.js");
var sources 		= require('../../datasources/index.js');

var model 			= module.exports;
model.getPosts 		= getPosts;
model.addFilter 	= addFilter;
model.deleteFilter 	= deleteFilter;
model.getFilters 	= getFilters;
model.listenFilter 	= listenFilter;
model.pauseFilter 	= pauseFilter;
model.playFilter 	= playFilter;

function getPosts(callback) {
    'use strict';
	var GetSeconds = 5;
	var timestamp = Math.floor(new Date() / 1000) - GetSeconds;

    var dataSend = [];
    var num = sources.tablesNum();
    var count = 0;

    var appendData = function(data){
        dataSend.push.apply(dataSend, data);
        count++;
        if(count == num){
            callback(dataSend);
        }
    };

    var appendFromCursor = function(cursor) {
        w.cursorToArray(cursor, appendData);
    };

	var filter = fparser.AndExpressions([{name:'timestamp', value:timestamp, op:'<'}]).toNoSQLQuery();
	for (var tableName of sources.tables()) {
		w.Connect(
			new w.GetByFilter(tableName, fparser.rethinkFilter(filter), appendFromCursor )
		);
	}
}

function addFilter(filterInfo, callback) {
    'use strict';
    w.connect(
        function(conn) {
			var filter = fparser.AndExpressions([{name:'userID', value:filterInfo.userID()},
		                                        {name:'table', value:filterInfo.table()},
												{name:'filterTitle', value:filterInfo.filterTitle()}]).toNoSQLQuery();
            r.table(config.tables.filters).filter( fparser.rethinkFilter(filter) ).isEmpty().run(conn).then(
    			function(empty){
    				if( empty ){
                        w.Connect(
                            new w.Insert(config.tables.filters, filterInfo.getData(), {returnChanges: true},
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
}

function deleteFilter(filterID, callback) {
    'use strict';
	console.log("Delete filter: " + filterID);
	updateFilterStatus(filterID, callback, fparser.filterStatus.DELETE);
}

function pauseFilter(filterID, callback) {
    'use strict';
	console.log("Pause filter: " + filterID);
	updateFilterStatus(filterID, callback, fparser.filterStatus.PAUSE);
}

function playFilter(filterID, callback) {
    'use strict';
	console.log("Play filter: " + filterID);
	updateFilterStatus(filterID, callback, fparser.filterStatus.PLAY);
}

function updateFilterStatus(filterID, callback, _status) {
    'use strict';
	w.Connect( new w.UpdateByKey(config.tables.filters, filterID, {status: _status}) );
}

function getFilters(userID, table, callback) {
    'use strict';
    var filter = fparser.AndExpressions([{name:'userID', value:userID},
                                        {name:'table', value:table}]).toNoSQLQuery();
    w.Connect(
        new w.GetByFilter(config.tables.filters, fparser.rethinkFilter(filter),
            function (cursor){
                w.cursorToArray(cursor, callback);
            }
        )
    );
}

function listenFilter(filterInfoData) {
    'use strict';
    var stopListen = false;
    w.connect(
        function(conn) {
            var filter = fparser.AndExpressions([{name:'userID', value:filterInfoData.userID},
                                    {name:'table', value:filterInfoData.table},
                                    {name:'filterTitle', value:filterInfoData.filterTitle}]).toNoSQLQuery();

			r.table(config.tables.filters).filter( fparser.rethinkFilter(filter) ).changes().run(conn).then(
    			function(cursor){
                    cursor.each(function(error, rowChange) {
						stopListen = true;
						w.close(cursor);
						var row = rowChange.new_val;
						if( row.status === fparser.filterStatus.DELETE ){
							w.Connect( new w.DeleteByKey(config.tables.filters, row.id), conn, false );
						}
						return false;				// stop listening for changes!
         			});
    			}
			).error(calls.throwError);

			r.table(filterInfoData.table).filter( fparser.rethinkFilter(filterInfoData.query) ).changes().run(conn).then(
                function(cursor) {
                   cursor.each(function(error, rowChange) {
                       	if( stopListen ){
                        	w.close(cursor);
                        	w.close(conn);
                        	return false;
                       	}
						var postID = ( rowChange.new_val !== null )? rowChange.new_val.id : rowChange.old_val.id;
                        var data = { filterData: filterInfoData, postData: rowChange, id: postID};
                        w.Connect( new w.Insert(config.tables.broadcast, data), conn, false );
    				});
        		}
			).error(calls.throwError);
    	}
    );
}
