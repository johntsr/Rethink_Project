var r		 			= require('rethinkdb');
var sources	 			= require('../datasources/index.js');

var model 				= module.exports;
model.rethinkFilter 	= rethinkFilter;
model.htmlSpecialChars 	= htmlSpecialChars;
model.choiceName 		= choiceName;
model.noSQL_OR 			= noSQL_OR;
model.noSQL_OR 			= noSQL_OR;
model.noSQL_AND 		= noSQL_AND;
model.valueConstraint	= valueConstraint;

// convert a string representing a rethinkdb query
// to the corresponding js function (eval!)
function rethinkFilter(filterStr){
	'use strict';
	return eval(filterStr);
}

// php-like escape of html input
function htmlSpecialChars(str){
	'use strict';
	var map = {
		'&': '&amp;',
		'<': '&lt;',
		'>': '&gt;',
		'"': '&quot;',
		"'": '&#039;'
	};
	return str.replace(/[&<>"']/g, function(m) { return map[m]; });
}

// escape a string before insert it to the db query-string
function db_escape(str){
	'use strict';
	return str.replace(/\\/g, "\\\\")
	   .replace(/\$/g, "\\$")
	   .replace(/'/g, "\\'")
	   .replace(/"/g, "\\\"");
}

// "stringify" a value
// if value is string, need to escape it!
function stringify(value){
	'use strict';
	if(typeof(value) == 'string'){
		return "'" + db_escape(value) + "'";
	}
	else{
		return value + "";
	}
}

// return the "index"-th value of "fieldName"
// eg. choices = {R, G, B}, choiceName("color", 0) = R
function choiceName(table, fieldName, choiceIndex){
	'use strict';
	for (var i = 0; i < sources[table].FieldsInfo.length; i++) {			// iterate over the information array of ALL fields
		if( sources[table].FieldsInfo[i].name === fieldName  ){			// find my slot in the array
			return sources[table].FieldsInfo[i].choices[choiceIndex];	// return the appropriate value
		}
	}
	return "BAD choiceName() call: fieldName = " + stringify(fieldName) + " , choiceIndex = " + choiceIndex;
}

// apppend an "or" clause to a db query
function noSQL_OR(expression){
	'use strict';
	return ".or(" + expression + ")";
}

// apppend an "and" clause to a db query
function noSQL_AND(expression){
	'use strict';
	return ".and(" + expression + ")";
}

// supported operators for a field: "=", "<", ">"
function valueConstraint(columnName, opSymbol, value){
	'use strict';
	var map = {
		"=" : "eq",
		">" : "gt",
		"<" : "lt"
	};

	return "r.row(" + stringify(columnName) + ")." + map[opSymbol] + "(" + stringify(value) + ")";
}
