/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/* jshint node: true */
'use strict';

var r = require('rethinkdb');
var calls = require("./callbacks.js");
var config = require('../config');

var model = module.exports;

model.connect = function(callback, errCallback){
    // if(!errCallback){
        errCallback = calls.throwError;
    // }
    r.connect(config.database).then(callback).error(errCallback);
};

model.insert = function (conn, table, data, extra, callback){
    r.table(table).insert(data, extra).run(conn).then(callback);
};

// model.deleteG = function (conn, table, key){
//     r.table(table).get(key).delete().run(conn);
// };
//
// model.deleteF = function (conn, table, filterStr){
//     r.table(table).filter(filterStr).delete().run(conn);
// };


function Connect(obj, errCallback){
    // if(!errCallback){
        errCallback = calls.throwError;
    // }
    r.connect(config.database).bind(obj).then(obj.method).error(errCallback);
}

model.Insert = Insert;
function Insert(_table, _data, _extra, _callback){
    if(!_extra){
        _extra = {};
    }
    if(!_callback){
        _callback = calls.noFun;
    }
    this.table = _table;
    this.data = _data;
    this.extra = _extra;
    this.callback = _callback;
}

Insert.prototype.method = function(conn){
    model.insert(conn, this.table, this.data, this.extra, this.callback);
};

Insert.prototype.run = function(){
    Connect(this);
};
