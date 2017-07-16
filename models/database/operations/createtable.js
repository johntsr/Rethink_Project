var op = require("./operation.js");
var r = require('rethinkdb');

var model 		= module.exports;
model.create	= create;

function create(_table, _data, _extra, _callback, _errCallback){
    'use strict';
	return new CreateTable(_table, _data, _extra, _callback, _errCallback);
}

CreateTable.prototype = Object.create(op.Operation.prototype);
CreateTable.prototype.constructor = CreateTable;

function CreateTable(_tablename, _extra, _callback, _errCallback){
    'use strict';
    op.Operation.call(this, "", _callback, _errCallback);
    if(!_extra){
      _extra = {};
    }

    this.tablename = _tablename;
    this.extra = _extra;
}

CreateTable.prototype.run = function (conn) {
    'use strict';
    return r.tableCreate(this.tablename).run(conn);
    // return r.tableCreate(this.tablename, this.extra).run(conn);
};
