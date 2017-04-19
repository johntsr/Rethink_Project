var op = require("./operation.js");
var r = require('rethinkdb');

var model 		= module.exports;
model.create	= create;

function create(_table, _data, _extra, _callback, _errCallback){
    'use strict';
	return new Insert(_table, _data, _extra, _callback, _errCallback);
}

Insert.prototype = Object.create(op.Operation.prototype);
Insert.prototype.constructor = Insert;

function Insert(_table, _data, _extra, _callback, _errCallback){
    'use strict';
    op.Operation.call(this, _table, _callback, _errCallback);
    if(!_extra){
        _extra = {};
    }
    this.data = _data;
    this.extra = _extra;
}

Insert.prototype.run = function (conn) {
    'use strict';
    return r.table(this.table).insert(this.data, this.extra).run(conn);
};
