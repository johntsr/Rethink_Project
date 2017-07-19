var generic 	= require("./genericparser.js");

var model 		= module.exports;
model.create	= create;

function create(table, filter){
	'use strict';
	return new StringParser(table, filter);
}

// a "StringParser" is a "GenericParser" on a boolean column, whose value is always "false"
function StringParser(table, filter){
	'use strict';
	generic.GenericParser.call(this, table, filter);
}

StringParser.prototype = Object.create(generic.GenericParser.prototype);
StringParser.prototype.constructor = StringParser;

// simply demand that this column is "false"
StringParser.prototype.toNoSQLQuery = function(){
	'use strict';
	return this.genericOp("match", this.filter.value);	// TODO
};
