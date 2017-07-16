var op = require("./operation.js");
var r = require('rethinkdb');

var model 		= module.exports;
model.create	= create;

function create(_table, _key, _callback, _errCallback){
    'use strict';
	return new GetAll(_table, _key, _callback, _errCallback);
}

GetAll.prototype = Object.create(op.Operation.prototype);
GetAll.prototype.constructor = GetAll;

function GetAll(_table, _callback, _errCallback){
    op.Operation.call(this, _table, _callback, _errCallback);
}

GetAll.prototype.run = function (conn) {
    return r.table(this.table).run(conn);
    // NOTE: alternate: get by filter, fitler = "true"!
};
