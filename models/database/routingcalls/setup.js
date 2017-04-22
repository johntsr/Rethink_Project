var r               = require('rethinkdb');
var w 				= require("../operations/index.js");
var config 			= require('../../../config');
var calls 			= require("../../callbacks.js");
var profile 		= require("./profile.js");
var filters 		= require("../../filterparser/index.js");

var model 			= module.exports;
model.setup 		= setup;

function setup(io) {
    w.connect(
        function(conn) {
            console.log("Setting up update listener...");
            listenCurrentFilters(conn);
			emitFilters(io, conn);
            emitPosts(io, conn);
        }
    );
}

function listenCurrentFilters(conn) {
	r.table(config.tables.filters).run(conn).then(function(cursor) {
		cursor.toArray(function(error, filters) {
			for(var i = 0; i < filters.length; i++){
				profile.listenFilter( filters[i] );
			}
		});
	}).error(calls.throwError);
}

function emitFilters(io, conn){
	r.table(config.tables.filters).changes().run(conn).then(function(cursor) {
		cursor.each(function(error, row) {
			var filterInfoData, emitType, emitData = {};
			if( row.new_val && !row.old_val ){
				filterInfoData = row.new_val;
				emitType = 'newFilter_';
				profile.listenFilter(filterInfoData);

				var _id = filterInfoData.id;
				var _title = filterInfoData.filterTitle;
				var _table = filterInfoData.table;
				emitData = { id: _id, filterTitle: _title, table: _table};
			}
			else if( !row.new_val && row.old_val ){
				filterInfoData = row.old_val;
				emitType = 'deleteFilter_';
				emitData = { id: filterInfoData.id};
			}
			else{
				filterInfoData = row.new_val;
				emitType = 'statusFilter_';
				emitData = { id: filterInfoData.id, status: filterInfoData.status};

				if( filterInfoData.status === filters.filterStatus.PLAY ){
					profile.listenFilter(filterInfoData);
				}
			}

			var userID = filterInfoData.userID;
			io.emit(emitType + userID, emitData);
		});
	}).error(calls.throwError);
}


function emitPosts(io, conn){
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
}
