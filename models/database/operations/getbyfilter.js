var op      = require("./operation.js");
var r       = require('rethinkdb');
var fparser = require("../../filterparser/index.js");

var model 		= module.exports;
model.create	= create;

function create(_table, _filter, _callback, _errCallback){
    'use strict';
	return new GetByFilter(_table, _filter, _callback, _errCallback);
}

GetByFilter.prototype = Object.create(op.Operation.prototype);
GetByFilter.prototype.constructor = GetByFilter;

function GetByFilter(_table, _filter, _callback, _errCallback){
    op.Operation.call(this, _table, _callback, _errCallback);
    this.filter = _filter;
}

GetByFilter.prototype.run = function (conn) {
    return r.table(this.table).filter( fparser.rethinkFilter(this.filter) ).run(conn);
};
