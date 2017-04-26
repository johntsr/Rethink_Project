var async 			= require('async');
var r               = require('rethinkdb');
var w 				= require("../../operations/index.js");
var config 			= require('../../../../config');
var calls 			= require("../../../callbacks.js");
var emitTypes 		= require("../emittypes/index.js");
var filterStatus 	= require("../../../filterparser/index.js").filterStatus;
var listenFilter 	= require("../profile.js").listenFilter;
var connections 	= require("../connections.js");
var selectors 		= require("./selectors.js");

var model 			= module.exports;
model.loginUser		= loginUser;

function loginUser(io, id) {
    w.connect(
        function(conn) {
            console.log("Setting up update listener...");
			connections.add(id, conn);
            listenCurrentFilters(id);
			emitFilters(io, id);
            emitPosts(io, id);
        }, false, connections.get(id)	// refresh reasons!
    );
}

function listenCurrentFilters(id) {
	var filter = selectors.userSelector(id);
	w.Connect( new w.GetByFilter(config.tables.filters, filter,
		function(cursor) {
			cursor.toArray(function(error, filters) {
				for(var i = 0; i < filters.length; i++){
					if( filters[i].status ===  filterStatus.PLAY ){
						listenFilter( filters[i] );
					}
				}
			});
		}
	) , connections.get(id));
}

function emitFilters(io, id){
	var filter = selectors.userSelector(id);
	w.connect(
		function (conn){
			r.table(config.tables.filters).filter(filter).changes().run(conn).then(function(cursor) {
				cursor.each(function(error, row) {
					if( !connections.alive(id) ){
						w.close(conn);
						return false;
					}
					emitTypes.createF(io, row).emit();
				});
			}).error(calls.throwError);
		}
	);
}

function emitPosts(io, id){
	var filter = selectors.userSelector(id);
    var policy = {squash: 1.0};
		w.connect(
			function (conn){
			r.table(config.tables.broadcast).filter(filter).changes(policy).run(conn).then(function(cursor) {
				cursor.each(function(error, row) {
					if( !connections.alive(id) ){
						w.close(conn);
						return false;
					}
					row = row.new_val;
					if(row && !row.sent){
						async.waterfall([
							function (callback){
								w.Connect(new w.GetByKey(config.tables.filters, row.filterID, function(data){callback(null, data);}), conn);
							},
							function (filterData, callback){
								var filter = selectors.spamSelector(filterData);
								w.Connect(new w.CountByFilter(config.tables.broadcast, filter, function(data){callback(null, filterData, data);}), conn);
							},
							function (filterData, count, callback){
								w.Connect(new w.UpdateByKey(config.tables.broadcast, row.id, {sent: true}), connections.get(id));
								if( count <= filterData.frequency.count ){
									w.Connect(new w.GetByKey(row.postTable, row.postID, function(data){callback(null, filterData, data);}), conn);
								}
								else{
									callback(null, null, null);
								}
							},
							function (filterData, postData, callback){
								if( postData ){
									emitTypes.createP(io, filterData, postData).emit();
								}
							}
						]);
					}
				});
			}).error(calls.throwError);
		});
}
