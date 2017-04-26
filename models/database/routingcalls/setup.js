var async 			= require('async');
var r               = require('rethinkdb');
var w 				= require("../operations/index.js");
var config 			= require('../../../config');
var calls 			= require("../../callbacks.js");
var emitTypes 		= require("./emittypes/index.js");
var fparser 		= require("../../filterparser/index.js");
var profile 		= require("./profile.js");
var connections 	= require("./connections.js");
var broadcastdata 	= require("./broadcastdata.js");

var model 			= module.exports;
model.loginUser	 	= loginUser;
model.logoutUser	= logoutUser;

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

function logoutUser(id){
	if(connections.alive(id)){	// extra check?
		connections.die(id);

		async.parallel([ stopListeningFilters.bind(null, id), stopEmittingPosts.bind(null, id)],
			function(error, results){
				connections.close(id);
			}
		);

	}
}


function listenCurrentFilters(id) {
	var filter = userSelector(id);
	w.Connect( new w.GetByFilter(config.tables.filters, filter,
		function(cursor) {
			cursor.toArray(function(error, filters) {
				for(var i = 0; i < filters.length; i++){
					if( filters[i].status ===  fparser.filterStatus.PLAY ){
						profile.listenFilter( filters[i] );
					}
				}
			});
		}
	) , connections.get(id));
}

function emitFilters(io, id){
	var filter = userSelector(id);
	var conn = connections.get(id);
	r.table(config.tables.filters).filter(filter).changes().run(conn).then(function(cursor) {
		cursor.each(function(error, row) {
			if( !connections.alive(id) ){
				return false;
			}
			emitTypes.createF(io, row).emit();
		});
	}).error(calls.throwError);
}

function emitPosts(io, id){
	var filter = userSelector(id);
    var policy = {squash: 1.0};
	var conn = connections.get(id);
    r.table(config.tables.broadcast).filter(filter).changes(policy).run(conn).then(function(cursor) {
        cursor.each(function(error, row) {
			if( !connections.alive(id) ){
				return false;
			}
            row = row.new_val;
            if(row){
				var conn = connections.get(id);
				async.waterfall([
					function (callback){
						w.Connect(new w.GetByKey(config.tables.filters, row.filterID, function(data){callback(null, data);}), conn);
					},
					function (filterData, callback){
						var filter = spamSelector(filterData);
						w.Connect(new w.CountByFilter(config.tables.broadcast, filter, function(data){callback(null, filterData, data);}), conn);
					},
					function (filterData, count, callback){
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
}

function userSelector(userID){
	return fparser.AndExpressions([
		{
    		name: 'userID',
    		value: userID
    	}
    ]).toNoSQLQuery();
}

function spamSelector(filterData){
	var currentTime = broadcastdata.getTime() - filterData.frequency.seconds;
	return fparser.AndExpressions([
		{
    		name: 'userID',
    		value: filterData.userID
    	},
		{
    		name: 'filterID',
    		value: filterData.id
    	},
		{
    		name: 'timestamp',
			op:	'>',
    		value: currentTime
    	}
    ]).toNoSQLQuery();
}

function stopListeningFilters(id, callback){
	var filter = userSelector(id);

	var setStatus = function (fid, status, callback){
		profile.setFilterStatus(id, fid, function(results){callback(null);}, status);
	};

	w.Connect( new w.GetByFilter(config.tables.filters, filter,
	function(cursor) {
		cursor.toArray(function(error, filters) {
			var toggle = function(fid, status, callback){
				async.series([setStatus.bind(null, fid, fparser.toggleStatus(status)), setStatus.bind(null, fid, status), function(){callback(null);}]);
			};

			var paralCalls = [];
			for(var i = 0; i < filters.length; i++){
				paralCalls.push( toggle.bind(null, filters[i].id, filters[i].status) );
			}

			async.parallel(paralCalls, function(){ callback(null);});
		});
	}) , connections.get(id));
}

function stopEmittingPosts(id, callback){
	var dummyBroadcast = broadcastdata.dummy();
	w.Connect( new w.Insert(config.tables.broadcast, dummyBroadcast, {}, function(){ callback(null);}
				), connections.get(id));
}
