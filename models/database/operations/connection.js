var r 				= require('rethinkdb');
var calls 			= require("../../callbacks.js");
var config 			= require('../../../config');
var Insert 				= require("./insert.js").create;
var CreateTable 	= require("./createtable.js").create;

var model 			  = module.exports;
model.connect 		= connect;
model.Connect 		= Connect;
model.ConnectToDB = ConnectToDB;
model.cursorToArray = cursorToArray;
model.cursorToField = cursorToField;
model.close 		= close;

function connect(callback, errCallback, conn, db){
  if(!errCallback){
      errCallback = calls.throwError;
  }

  if(!db){
      db = config.database;
  }

	if(!conn){
		r.connect(db).then(callback).error(errCallback);
	}
	else{
		callback(conn);
	}
}

function ConnectToDB(db, obj, conn, closeFlag){
  Connect(obj, conn, closeFlag, db);
}

function Connect(obj, conn, closeFlag, db){
  var errCallback = calls.throwError;

  if(!db){
      db = config.database;
  }

	if(!closeFlag){
		closeFlag = false;
	}

	if(!conn){
	    r.connect(db).bind(obj).then(
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
