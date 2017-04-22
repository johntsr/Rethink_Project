var op = require("./operation.js");
var r = require('rethinkdb');

var model 		= module.exports;
model.create	= create;

function create(_table, _key, _callback, _errCallback){
    'use strict';
	return new UpdateByKey(_table, _key, _callback, _errCallback);
}

UpdateByKey.prototype = Object.create(op.Operation.prototype);
UpdateByKey.prototype.constructor = UpdateByKey;

function UpdateByKey(_table, _key, _data, _callback, _errCallback){
    op.Operation.call(this, _table, _callback, _errCallback);
    this.key = _key;
	this.data = _data;
}

UpdateByKey.prototype.run = function (conn) {
    return r.table(this.table).get(this.key).update(this.data).run(conn);
};
