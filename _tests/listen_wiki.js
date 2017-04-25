/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/* jshint node: true*/
'use strict';

var calls = require('../models/callbacks.js');
var wiki = require("../models/datasources/wikipost.js");
var r = require('rethinkdb');
var config = require('../config');
var w = require("../models/database/operations/index.js");
var fparser = require('../models/filterparser/index.js');


var PostsArray = [];
var Limit = 1000;
var SaveInterval = 10;
var DeleteInterval = 11;
var DeleteSeconds = 5;

// var EventSource = require('eventsource');
// var url = 'https://stream.wikimedia.org/v2/stream/recentchange';
// var eventSource = new EventSource(url);
// eventSource.onopen = function (event) {
//     console.log('--- Opened connection.');
// };
//
// eventSource.onerror = function (event) {
//     console.error('--- Encountered error', event);
// };
//
// eventSource.onmessage = function(event) {
// 	if( PostsArray.length < Limit ){
// 	    var streamInfo = JSON.parse(event.data);
// 		var dbData = wiki.create(streamInfo).getData();
// 		PostsArray.push(dbData);
// 	}
// };

function saveToDB(){
	w.Connect( new w.Insert(config.tables.wiki, PostsArray, {},
		 	function (){
				PostsArray = [];
				console.log("Inserted!");
			})
	);
}

function deleteFromDB(){
	var timestamp = Math.floor(new Date() / 1000) - DeleteSeconds;
    var filter = fparser.AndExpressions([{name:'timestamp', value:timestamp, op:'='}]).toNoSQLQuery();
	w.Connect( new w.DeleteByFilter(config.tables.wiki, filter,
		 	function (){
				console.log("Deleted!");
			})
	);
}

function insertOne(){
		w.Connect( new w.Insert(config.tables.wiki, {
	"bot": true ,
	"comment": "/* wbeditentity-update:0| */ BOT - Adding descriptions (28 languages): ar, be, be-tarask, bs, cy, de-at, de-ch, eo, gsw, hr, hu, hy, lb, lv, nap, sco, sk, sl, sr, uk, vi, yue, zh-cn, zh-hk, zh-mo, zh-my, zh-sg, zh-tw" ,
	"namespace": 0 ,
	"server_name":  "www.wikidata.org" ,
	"timestamp": 1489835329 ,
	"title":  "OLE KAKAKA" ,
	"type":  "edit" ,
	"user":  "Emijrpbot" ,
	"wiki":  "wikidatawiki"
	}) );
}

// setInterval(saveToDB, SaveInterval * 1000);
// setInterval(deleteFromDB, DeleteInterval * 1000);



// for (var i = 0; i < 100; i++) {
// 	setTimeout(insertOne, 0.1 * i * 1000);
// }

var async 			= require('async');
var id1 = "326beeab-7266-4317-8a15-c76d570ec8bd", id2 = "3bb0be92-fcf2-45c2-a291-3a1b3856fdce";
var wikis = [];

function append(data){
	wikis.push(data);
}


async.parallel([
	function (callback){
		w.Connect(new w.GetByKey(config.tables.wiki, id1, function(data){callback(null, data);}));
	},

	function (callback){
		w.Connect(new w.GetByKey(config.tables.wiki, id2, function(data){callback(null, data);}));
	}
],
	function(err, results) {
		for (wiki of results) {
			console.log(wiki);
		}
	}
);
