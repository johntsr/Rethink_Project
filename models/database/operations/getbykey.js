var op = require("./operation.js");
var r = require('rethinkdb');

var model 		= module.exports;
model.create	= create;

function create(_table, _key, _callback, _errCallback){
    'use strict';
	return new GetByKey(_table, _key, _callback, _errCallback);
}

GetByKey.prototype = Object.create(op.Operation.prototype);
GetByKey.prototype.constructor = GetByKey;

function GetByKey(_table, _key, _callback, _errCallback){
    op.Operation.call(this, _table, _callback, _errCallback);
    this.key = _key;
}

GetByKey.prototype.run = function (conn) {
    return r.table(this.table).get(this.key).run(conn);
};
