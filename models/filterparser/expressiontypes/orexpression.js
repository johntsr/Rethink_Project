var db_help 		= require("../db_help.js");
var filterparser 	= require("../parsers/genericparser.js");

var model 			= module.exports;
model.create		= create;

function create(exprArray){
	'use strict';
	return new OrExpressions(exprArray);
}

function OrExpressions(exprArray){
	'use strict';
	this.exprArray = exprArray;
	for(var i = 0; i < this.exprArray.length; i++) {
		if(!this.exprArray[i].op){
			this.exprArray[i].op = "=";
		}
	}
}

OrExpressions.prototype.toNoSQLQuery = function(){
	'use strict';
	var op = this.exprArray[0].op;
	var value = this.exprArray[0].value;
	var query = filterparser.create(null, this.exprArray[0]).genericOp(op, value);
	for(var i = 1; i < this.exprArray.length; i++) {
		op = this.exprArray[i].op;
		value = this.exprArray[i].value;
		query += db_help.noSQL_OR( filterparser.create(null, this.exprArray[i]).genericOp(op, value) );
	}
	return query;
};
