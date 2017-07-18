var op = require("./operation.js");
var r = require('rethinkdb');

var model 		= module.exports;
model.create	= create;

function create(_table, _data, _extra, _callback, _errCallback){
    'use strict';
	return new DropTable(_table, _data, _extra, _callback, _errCallback);
}

DropTable.prototype = Object.create(op.Operation.prototype);
DropTable.prototype.constructor = DropTable;

function DropTable(_tablename, _extra, _callback, _errCallback){
    'use strict';
    op.Operation.call(this, "", _callback, _errCallback);
    if(!_extra){
      _extra = {};
    }

    this.tablename = _tablename;
    this.extra = _extra;
}

DropTable.prototype.run = function (conn) {
    'use strict';
    return r.tableDrop(this.tablename).run(conn);
};
