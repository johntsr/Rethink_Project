var generic 	= require("./genericparser.js");

var model 		= module.exports;
model.create	= create;

function create(filter){
	'use strict';
	return new BoolParser(filter);
}

// a "BoolParser" is a "GenericParser" on a boolean column, whose value is always "false"
function BoolParser (filter){
	'use strict';
	generic.GenericParser.call(this, filter);
}

BoolParser.prototype = Object.create(generic.GenericParser.prototype);
BoolParser.prototype.constructor = BoolParser;

// simply demand that this column is "false"
BoolParser.prototype.toNoSQLQuery = function(){
	'use strict';
	return this.genericOp("=", false);
};
