/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/* jshint node: true */
'use strict';

var Promise = require("bluebird");
var r = require('rethinkdb');
var calls = require("./callbacks.js");
var config = require('../config');

var model = module.exports;
model.cursorToArray = cursorToArray;
model.cursorToField = cursorToField;
model.close = close;
model.connect = connect;
model.Connect = Connect;
model.Insert = Insert;
model.DeleteByKey = DeleteByKey;
model.DeleteByFilter = DeleteByFilter;
model.GetByKey = GetByKey;
model.GetByFilter = GetByFilter;

function connect(callback, errCallback){
    if(!errCallback){
        errCallback = calls.throwError;
    }
    r.connect(config.database).then(callback).error(errCallback);
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


function Operation(_table, _callback, _errCallback){
    if(!_callback){
        _callback = calls.noFun;
    }
    if(!_errCallback){
        _errCallback = calls.throwError;
    }
    this.table = _table;
    this.callback = _callback;
    this.errCallback = _errCallback;
}




Insert.prototype = Object.create(Operation.prototype);
Insert.prototype.constructor = Insert;

function Insert(_table, _data, _extra, _callback, _errCallback){
    Operation.call(this, _table, _callback, _errCallback);
    if(!_extra){
        _extra = {};
    }
    this.data = _data;
    this.extra = _extra;
}

Insert.prototype.run = function (conn) {
    return r.table(this.table).insert(this.data, this.extra).run(conn);
};




DeleteByKey.prototype = Object.create(Operation.prototype);
DeleteByKey.prototype.constructor = DeleteByKey;

function DeleteByKey(_table, _key, _callback, _errCallback){
    Operation.call(this, _table, _callback, _errCallback);
    this.key = _key;
}

DeleteByKey.prototype.run = function (conn) {
    return r.table(this.table).get(this.key).delete().run(conn);
};




DeleteByFilter.prototype = Object.create(Operation.prototype);
DeleteByFilter.prototype.constructor = DeleteByFilter;

function DeleteByFilter(_table, _filter, _callback, _errCallback){
    Operation.call(this, _table, _callback, _errCallback);
    this.filter = _filter;
}

DeleteByFilter.prototype.run = function (conn) {
    return r.table(this.table).filter( this.filter).delete().run(conn);
};




GetByKey.prototype = Object.create(Operation.prototype);
GetByKey.prototype.constructor = GetByKey;

function GetByKey(_table, _key, _callback, _errCallback){
    Operation.call(this, _table, _callback, _errCallback);
    this.key = _key;
}

GetByKey.prototype.run = function (conn) {
    return r.table(this.table).get(this.key).run(conn);
};




GetByFilter.prototype = Object.create(Operation.prototype);
GetByFilter.prototype.constructor = GetByFilter;

function GetByFilter(_table, _filter, _callback, _errCallback){
    Operation.call(this, _table, _callback, _errCallback);
    this.filter = _filter;
}

GetByFilter.prototype.run = function (conn) {
    return r.table(this.table).filter( this.filter).run(conn);
};
