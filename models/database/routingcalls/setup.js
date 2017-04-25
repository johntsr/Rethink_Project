var r               = require('rethinkdb');
var w 				= require("../operations/index.js");
var config 			= require('../../../config');
var calls 			= require("../../callbacks.js");
var profile 		= require("./profile.js");
var emitTypes 		= require("./emittypes/index.js");
var fparser 		= require("../../filterparser/index.js");
var connections 	= require("./connections.js");
var async 			= require('async');

var model 			= module.exports;
model.newUser	 	= newUser;

function newUser(io, id) {
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
            row = row.new_val;
            if(row){
				var spam = false;		// TODO
				if( !spam ){
					emitToUser(io, conn, row);
				}
				else{
					console.log("Spam!");
				}
            }
        });
    }).error(calls.throwError);
}

function emitToUser(io, conn, row){
	async.parallel({
		postData: function (callback){
			w.Connect(new w.GetByKey(row.postTable, row.postID, function(data){callback(null, data);}), conn);
		},

		filterData: function (callback){
			w.Connect(new w.GetByKey(config.tables.filters, row.filterID, function(data){callback(null, data);}), conn);
		}
	},
		function(err, results) {
			console.log("Done!");
			emitTypes.createP(io, results.filterData, results.postData).emit();
			// w.Connect(new w.DeleteByKey(config.tables.broadcast, row.id), conn);
		}
	);
}

function userSelector(userID){
	return fparser.AndExpressions([
		{
    		name: 'userID',
    		value: userID
    	}
    ]).toNoSQLQuery();
}
