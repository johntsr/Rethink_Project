/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/* jshint node: true*/
'use strict';

// var server = require('http');
var request = require('request');

var sendMore = true;
var PostsArray = [];
var Limit = 1;
var SaveInterval = 10;
var DeleteInterval = 11;
var DeleteSeconds = 5;

var EventSource = require('eventsource');
var url = 'https://stream.wikimedia.org/v2/stream/recentchange';
var eventSource = new EventSource(url);
eventSource.onopen = function (event) {
    console.log('--- Opened connection.');
};

eventSource.onerror = function (event) {
    console.error('--- Encountered error', event);
};

eventSource.onmessage = function(event) {
	if( PostsArray.length < Limit ){
	    var dbData = JSON.parse(event.data);
			PostsArray.push(dbData);
	}
	else {
		for(var i = 0; i < PostsArray.length; i++){
			if( i == PostsArray.length - 1){
				sendMore = false;
			}
			saveToDB(PostsArray[i]);

		}
	}
};

function saveToDB(data){
	console.log(data);
	request.post(
    'http://localhost:3000/sources/Wiki',
    {json: data},
    function (error, response, body) {
        if (!error && response.statusCode == 200) {
            console.log(body)
        }
	else{
		console.log('Error!');
		console.log(response);
	}

	if( !sendMore ){
		process.exit();
	}
    }
	);
	// var post_data = JSON.stringify(PostsArray[0]);
	//
	// var post_options = {
  //     host: 'localhost',
  //     port: '3000',
  //     path: '/sources/Wiki',
  //     method: 'POST',
  //     headers: {
  //         'Content-Type': 'application/json',
  //         'Content-Length': Buffer.byteLength(post_data)
  //     }
  // };
	//
	// var post_req = http.request(post_options, function(res) {
  //     res.setEncoding('utf8');
  //     res.on('data', function (chunk) {
  //         console.log('Response: ' + chunk);
  //     });
  // });
	//
  // // post the data
  // post_req.write(post_data);
  // post_req.end();
}
