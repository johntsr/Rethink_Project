var async 			= require('async');
var w 				= require("../../operations/index.js");
var config 			= require('../../../../config');
var toggleStatus 	= require("../../../filterparser/index.js").toggleStatus;
var setFilterStatus = require("../profile.js").setFilterStatus;
var connections 	= require("../connections.js");
var dummyBroadcast 	= require("../broadcastdata.js").dummy;
var userSelector 	= require("./selectors.js").userSelector;

var model 			= module.exports;
model.logoutUser	= logoutUser;

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



function stopListeningFilters(id, callback){
	var filter = userSelector(id);

	var setStatus = function (fid, status, callback){
		setFilterStatus(id, fid, function(results){callback(null);}, status);
	};

	w.Connect( new w.GetByFilter(config.tables.filters, filter,
	function(cursor) {
		cursor.toArray(function(error, filters) {
			var toggle = function(fid, status, callback){
				async.series([setStatus.bind(null, fid, toggleStatus(status)), setStatus.bind(null, fid, status), function(){callback(null);}]);
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
	w.Connect( new w.Insert(config.tables.broadcast, dummyBroadcast(), {}, function(){ callback(null);}
				), connections.get(id));
}
