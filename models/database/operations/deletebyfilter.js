var op = require("./operation.js");
var r = require('rethinkdb');

var model 		= module.exports;
model.create	= create;

function create(_table, _filter, _callback, _errCallback){
    'use strict';
	return new DeleteByFilter(_table, _filter, _callback, _errCallback);
}

DeleteByFilter.prototype = Object.create(op.Operation.prototype);
DeleteByFilter.prototype.constructor = DeleteByFilter;

function DeleteByFilter(_table, _filter, _callback, _errCallback){
    op.Operation.call(this, _table, _callback, _errCallback);
    this.filter = _filter;
}

DeleteByFilter.prototype.run = function (conn) {
    return r.table(this.table).filter(fparser.rethinkFilter(this.filter)).delete().run(conn);
};
