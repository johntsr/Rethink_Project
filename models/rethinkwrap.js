/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/* jshint node: true */
'use strict';

var Promise = require("bluebird");
var r = require('rethinkdb');
var calls = require("./callbacks.js");
var config = require('../config');

var model = module.exports;

model.connect = function(callback, errCallback){
    if(!errCallback){
        errCallback = calls.throwError;
    }
    r.connect(config.database).then(callback).error(errCallback);
};

model.close = close;

function close(conn){
    conn.close();
}

model.Connect = function(obj, errCallback){
    if(!errCallback){
        errCallback = calls.throwError;
    }
    r.connect(config.database).bind(obj).then(
        function (conn){
            obj.run(conn).then(
                function (results){
                    obj.callback(results);
                    close(conn);
                }
            ).error(
                function (error){
                    obj.errCallback(error);
                    close(conn);
                }
            );
        }
    ).error(errCallback);
};

model.Insert = Insert;
function Insert(_table, _data, _extra, _callback, _errCallback){
    if(!_extra){
        _extra = {};
    }
    if(!_callback){
        _callback = calls.noFun;
    }
    if(!_errCallback){
        _errCallback = calls.throwError;
    }
    this.table = _table;
    this.data = _data;
    this.extra = _extra;
    this.callback = _callback;
    this.errCallback = _errCallback;
}

Insert.prototype.run = function (conn) {
    return r.table(this.table).insert(this.data, this.extra).run(conn);
};

model.DeleteByKey = DeleteByKey;
function DeleteByKey(_table, _key, _callback, _errCallback){
    if(!_callback){
        _callback = calls.noFun;
    }
    if(!_errCallback){
        _errCallback = calls.throwError;
    }
    this.table = _table;
    this.key = _key;
    this.callback = _callback;
    this.errCallback = _errCallback;
}

DeleteByKey.prototype.run = function (conn) {
    return r.table(this.table).get(this.key).delete().run(conn);
};

model.DeleteByFilter = DeleteByFilter;
function DeleteByFilter(_table, _filterStr, _callback, _errCallback){
    if(!_callback){
        _callback = calls.noFun;
    }
    if(!_errCallback){
        _errCallback = calls.throwError;
    }
    this.table = _table;
    this.filterStr = _filterStr;
    this.callback = _callback;
    this.errCallback = _errCallback;
}

DeleteByFilter.prototype.run = function (conn) {
    return r.table(this.table).filter( eval(this.filterStr)).delete().run(conn);
};
