/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/* jshint node: true*/
'use strict';

var calls = require('../models/callbacks.js');
var wiki = require("../models/wikipost.js");
var r = require('rethinkdb');
var config = require('../config');
var w = require("../models/rethinkwrap.js");
var fparser = require('../models/filterparser/index.js');
var EventSource = require('eventsource');

var url = 'https://stream.wikimedia.org/v2/stream/recentchange';
var eventSource = new EventSource(url);

var PostsArray = [];
var Limit = 1000;
var SaveInterval = 10;
var DeleteInterval = 11;
var DeleteSeconds = 5;

eventSource.onopen = function (event) {
    console.log('--- Opened connection.');
};

eventSource.onerror = function (event) {
    console.error('--- Encountered error', event);
};

eventSource.onmessage = function(event) {
	if( PostsArray.length < Limit ){
	    var streamInfo = JSON.parse(event.data);
		var dbData = new wiki.WikiPost(streamInfo).getData();
		PostsArray.push(dbData);
	}
};

function saveToDB(){
	w.Connect( new w.Insert(config.wiki, PostsArray, {},
		 	function (){
				PostsArray = [];
				console.log("Inserted!");
			})
	);
}

function deleteFromDB(){
	var timestamp = Math.floor(new Date() / 1000) - DeleteSeconds;
    var filter = fparser.AndExpressions([{name:'timestamp', value:timestamp, op:'='}]).toNoSQLQuery();
	w.Connect( new w.DeleteByFilter(config.wiki, fparser.rethinkFilter(filter),
		 	function (){
				console.log("Deleted!");
			})
	);
}


setInterval(saveToDB, SaveInterval * 1000);
setInterval(deleteFromDB, DeleteInterval * 1000);
