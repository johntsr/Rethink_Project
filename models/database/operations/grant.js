var op = require("./operation.js");
var r = require('rethinkdb');

var model 		= module.exports;
model.create	= create;

function create(_table, _username, _permissions, _callback, _errCallback){
    'use strict';
	return new Grant(_table, _username, _permissions, _callback, _errCallback);
}

Grant.prototype = Object.create(op.Operation.prototype);
Grant.prototype.constructor = Grant;

function Grant(_table, _username, _permissions, _callback, _errCallback){
    'use strict';
    op.Operation.call(this, "", _callback, _errCallback);
    this.table = _table;
    this.username = _username;
    this.permissions = _permissions;
}

Grant.prototype.run = function (conn) {
    'use strict';
    return r.table(this.table).grant(this.username, this.permissions).run(conn);
};
