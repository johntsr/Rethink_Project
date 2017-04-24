var r               = require('rethinkdb');
var w 				= require("../operations/index.js");
var config 			= require('../../../config');
var calls 			= require("../../callbacks.js");
var profile 		= require("./profile.js");
var filters 		= require("../../filterparser/index.js");
var emitTypes 		= require("./emittypes/index.js");

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
			emitTypes.createF(io, row).emit();
		});
	}).error(calls.throwError);
}


function emitPosts(io, conn){
    var policy = {squash: 1.0};
    r.table(config.tables.broadcast).changes(policy).run(conn).then(function(cursor) {
        cursor.each(function(error, row) {
            row = row.new_val;
            if(row){
                emitTypes.createP(io, row.filterData, row.postData).emit();
                w.Connect(new w.DeleteByKey(config.tables.broadcast, row.id), conn, false);
            }
        });
    }).error(calls.throwError);
}
