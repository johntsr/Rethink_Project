/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/* jshint node: true */

'use strict';

var calls = require('../models/callbacks.js');

var r = require('rethinkdb');
var config = require('../config');

var EventSource = require('eventsource');
var url = 'https://stream.wikimedia.org/v2/stream/recentchange';

// console.log(`Connecting to EventStreams at ${url}`);
var eventSource = new EventSource(url);

eventSource.onopen = function (event) {
    console.log('--- Opened connection.');
};

eventSource.onerror = function (event) {
    console.error('--- Encountered error', event);
};

r.connect(config.database).then( function(conn) {

	var columnsOfInterest = [ 	"bot", "comment", "namespace", "server_name",
								"timestamp", "title", "type", "user", "wiki" ];

	var written = 0;
	var count = 0;
	var Limit = 2;

    eventSource.onmessage = function(event) {

		count++;
		if( count > Limit ){
			return;
		}

        var streamInfo = JSON.parse(event.data);
		var dbData = {};
		for (var i = 0; i < columnsOfInterest.length; i++) {
        	dbData[ columnsOfInterest[i] ] = streamInfo[ columnsOfInterest[i] ];
        }

        r.table(config.table).insert(dbData).run(conn)
			.then( function (result) {
				written++;
				if( written == Limit ){
					eventSource.close();
					conn.close( calls.throwErrorCond );
				}
			} )
			.error( calls.throwError );
    };
}).error( calls.throwError );
