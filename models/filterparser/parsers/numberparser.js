var generic 	= require("./genericparser.js");

var model 		= module.exports;
model.create	= create;

function create(table, filter){
	'use strict';
	return new NumberParser(table, filter);
}

// a "NumberParser" is a "GenericParser" on a number column
function NumberParser(table, filter){
	'use strict';
	generic.GenericParser.call(this, table, filter);
}

NumberParser.prototype = Object.create(generic.GenericParser.prototype);
NumberParser.prototype.constructor = NumberParser;

// simply demand that this column is "false"
NumberParser.prototype.toNoSQLQuery = function(){
	'use strict';
	return this.genericOp(this.filter.op, this.filter.value);
};
