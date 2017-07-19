var db_help 		= require("../db_help.js");

var model 			= module.exports;
model.create		= create;
model.GenericParser	= GenericParser;

function create(table, filter){
	'use strict';
	return new GenericParser(table, filter);
}

// abstract class defining a "GenericParser" based on a user "option"
// "GenericParser" basically transforms a user contraint on a db column to a query-string
function GenericParser(table, filter){
	'use strict';
	this.table = table;
	this.filter = filter;
}

// get column name
GenericParser.prototype.filterName = function(){
	'use strict';
	return this.filter.name;
};

// get column name
GenericParser.prototype.filterTable = function(){
	'use strict';
	return this.table;
};

// create a constraint-string for this column
GenericParser.prototype.genericOp = function(opSymbol, value){
	'use strict';
	return db_help.valueConstraint(this.filterName(), opSymbol, value);
};

// child classes will override this!
GenericParser.prototype.toNoSQLQuery = function(){
	'use strict';
	return "";
};
