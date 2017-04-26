/*jshint esversion: 6 */

var r               = require('rethinkdb');
var w 				= require("../operations/index.js");
var fparser 		= require('../../filterparser/index.js');
var config 			= require('../../../config');
var calls 			= require("../../callbacks.js");
var emittypes 		= require("./emittypes/index.js");
var sources 		= require('../../datasources/index.js');
var broadcast 		= require('./broadcastdata.js');
var connections 	= require("./connections.js");

var model 			= module.exports;
model.getPosts 		= getPosts;
model.addFilter 	= addFilter;
model.getFilters 	= getFilters;
model.listenFilter 	= listenFilter;
model.setFilterStatus 	= setFilterStatus;

function getPosts(id, callback) {
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

    // TODO: '>'
	var filter = fparser.AndExpressions([{name:'timestamp', value:timestamp, op:'<'}]).toNoSQLQuery();
	for (var tableName of sources.tables()) {
		w.Connect(
			new w.GetByFilter(tableName, filter, appendFromCursor ), connections.get(id)
		);
	}
}

function addFilter(filterInfo, callback) {
    var id = filterInfo.userID;
    w.connect(
        function(conn) {
			var filter = filterSelector(filterInfo.getData());
            r.table(config.tables.filters).filter( fparser.rethinkFilter(filter) ).isEmpty().run(conn).then(
    			function(empty){
    				if( empty ){
                        w.Connect(
                            new w.Insert(config.tables.filters, filterInfo.getData(), {returnChanges: true},
                                function(data){
                                    callback(data.inserted > 0);
                                }
                        ), conn);
    				}
    				else{
    					callback(false);
    				}
    			}
    		).error(calls.throwError);
        }, false, connections.get(id)
    );
}

function setFilterStatus(id, filterID, callback, _status) {
	w.Connect( new w.UpdateByKey(config.tables.filters, filterID, {status: _status}, callback), connections.get(id));
}

function getFilters(id, table, callback) {
    var filter = filterUserSelector(id, table);
    w.Connect(
        new w.GetByFilter(config.tables.filters, filter,
            function (cursor){
                w.cursorToArray(cursor, callback);
            }
        ), connections.get(id)
    );
}

function listenFilter(fInfoData) {
    var stopListen = false;
	var id = fInfoData.userID;
    w.connect(
        function(conn) {
            r.table(config.tables.filters).get(fInfoData.id).changes().run(conn).then(
    			function(cursor){
                    cursor.each(function(error, rowChange) {
						stopListen = true;
						w.close(cursor);
						var row = rowChange.new_val;
						if( row.status === fparser.filterStatus.DELETE ){
							w.Connect( new w.DeleteByKey(config.tables.filters, row.id), conn);
						}
						return false;				// stop listening for changes!
         			});
    			}
			).error(calls.throwError);

            var policy = {
            	squash: fInfoData.squash
            };
			r.table(fInfoData.table).filter( fparser.rethinkFilter(fInfoData.query) ).changes(policy).run(conn).then(
                function(cursor) {
                   cursor.each(function(error, rowChange) {
                       	if( stopListen ){
                        	w.close(cursor);
                        	return false;
                       	}
                        if( !rowChange.error ){
                            var broadcastData = broadcast.create(fInfoData, rowChange);
                            w.Connect( new w.Insert(config.tables.broadcast, broadcastData), conn);
                        }
    				});
        		}
			).error(calls.throwError);
    	}, false, connections.get(id)
    );
}


function filterUserSelector(userID, table){
    return fparser.AndExpressions([
		{
    		name: 'userID',
    		value: userID
    	},
    	{
    		name: 'table',
    		value: table
    	}
    ]).toNoSQLQuery();
}

function filterSelector(fInfoData){
    return fparser.AndExpressions([{
            name: 'userID',
            value: fInfoData.userID
        },
        {
            name: 'table',
            value: fInfoData.table
        },
        {
            name: 'filterTitle',
            value: fInfoData.filterTitle
        }
    ]).toNoSQLQuery();
}
