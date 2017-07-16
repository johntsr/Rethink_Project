var op = require("./operation.js");
var r = require('rethinkdb');

var model 		= module.exports;
model.create	= create;

function create(_table, _data, _extra, _callback, _errCallback){
    'use strict';
	return new CreateDB(_table, _data, _extra, _callback, _errCallback);
}

CreateDB.prototype = Object.create(op.Operation.prototype);
CreateDB.prototype.constructor = CreateDB;

function CreateDB(_dbname, _callback, _errCallback){
    'use strict';
    op.Operation.call(this, "", _callback, _errCallback);
    this.dbname = _dbname;
}

CreateDB.prototype.run = function (conn) {
    'use strict';
    return r.dbCreate(this.dbname).run(conn);
};
