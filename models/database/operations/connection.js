var r 				= require('rethinkdb');
var calls 			= require("../../callbacks.js");
var config 			= require('../../../config');

var model 			= module.exports;
model.connect 		= connect;
model.Connect 		= Connect;
model.cursorToArray = cursorToArray;
model.cursorToField = cursorToField;
model.close 		= close;

function connect(callback, errCallback){
    if(!errCallback){
        errCallback = calls.throwError;
    }
    r.connect(config.database).then(callback).error(errCallback);
}

function Connect(obj, conn, closeFlag){
    var errCallback = calls.throwError;

	if(!conn){
	    r.connect(config.database).bind(obj).then(
	        function (newConn){
	            runAndClose(newConn, obj, true);
	        }
	    ).error(errCallback);
	}
	else{
        runAndClose(conn, obj, closeFlag);
	}
}


function cursorToArray(cursor, callback){
    cursor.toArray(function(error, results) {
        calls.throwErrorCond(error);
        callback(results);
    });
}

function cursorToField(cursor, callback){
    cursor.toArray(function(error, results) {
        calls.throwErrorCond(error);
        if(results.length > 0){
            callback(false, results[0]);
        }
        else{
            callback(false, null);
        }
    });
}

function close(conn){
    conn.close();
}

function runAndClose(conn, obj, closeFlag){
	obj.run(conn).then(
		function (results){
			obj.callback(results);
            if(closeFlag){
                close(conn, closeFlag);
            }
		}
	).error(
		function (error){
			obj.errCallback(error);
			if(closeFlag){
                close(conn, closeFlag);
            }
		}
	);
}
