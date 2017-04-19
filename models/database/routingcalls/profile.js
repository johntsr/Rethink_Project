var r               = require('rethinkdb');
var w 				= require("../operations/index.js");
var fparser 		= require('../../filterparser/index.js');
var config 			= require('../../../config');
var calls 			= require("../../callbacks.js");
var broadcast 		= require("../../wikibroadcast.js");

var model 			= module.exports;
model.getPosts 		= getPosts;
model.addFilter 	= addFilter;
model.deleteFilter 	= deleteFilter;
model.getFilters 	= getFilters;
model.listenFilter 	= listenFilter;

function getPosts(callback) {
    'use strict';
	var GetSeconds = 5;
	var timestamp = Math.floor(new Date() / 1000) - GetSeconds;
    var filter = fparser.AndExpressions([{name:'timestamp', value:timestamp, op:'<'}]).toNoSQLQuery();
    w.Connect(
        new w.GetByFilter(config.wiki, fparser.rethinkFilter(filter), function(cursor) {w.cursorToArray(cursor, callback);} )
    );
}

function addFilter(filterInfo, callback) {
    'use strict';
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
}

function deleteFilter(filterID, callback) {
    'use strict';
	console.log("Delete filter: " + filterID);
    w.Connect( new w.DeleteByKey(config.filters, filterID) );
}

function getFilters(userID, table, callback) {
    'use strict';
    var filter = fparser.AndExpressions([{name:'userID', value:userID},
                                        {name:'table', value:table}]).toNoSQLQuery();
    w.Connect(
        new w.GetByFilter(config.filters, fparser.rethinkFilter(filter),  function (cursor){w.cursorToArray(cursor, callback);} )
    );
}

function listenFilter(filterInfoData) {
    'use strict';
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
    			   prepareBroadcast(new broadcast.WikiBroadcast(filterInfoData, rowChange) );
    			});
        	}).error(calls.throwError);
    	}
    );
}

function prepareBroadcast(wikiBroadcast) {
    'use strict';
    w.Connect( new w.Insert(config.broadcast, wikiBroadcast.getData()) );
}
