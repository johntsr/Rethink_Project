var boolParser 	= require("./parsers/boolparser.js");
var multiParser = require("./parsers/multipleparser.js");
var db_help 	= require("./db_help.js");

var model 		= module.exports;
model.create 	= create;

// create a "FilterParser" based on a user "option"
function createFilterParser(filter){
	'use strict';
	switch ( filter.name ) {
		case "bot": return boolParser.create(filter);
		case "type": return multiParser.create(filter);
		default: return null;
	}
}


function create(_userID, filterData){
	'use strict';
	return new FilterInfo(_userID, filterData);
}


// class that extracts all the information regarding a user defined filter
function FilterInfo(_userID, filterData){
	'use strict';

	// _userID		: the id of the user in the db
	// filterData	: the "raw" filter data that the user sent

	// all the information will be stored here
	// that way, it can be easily extracted as a unit
	this.filterInfo = {};

	this.filterInfo.filterTitle = filterData.filterTitle;	// the title of the filter
	this.filterInfo.table = filterData.table;				// the db table on which it operates
	this.filterInfo.userID = _userID;						// the db id of the user
	this.filterInfo.query = "";								// initialize the query-string, then construct it

	// first, get the options of the filter
	// ie. the column names of the matching table are meant, as defined in "FieldsInfo" table (models/wikipost.js)
	var filters = filterData.filterOptions;

	// reg. expr. of the query: "(expression)('AND'(expression))*"
	// so, first apply the expression (column constraint)
	// and, in the loop, append the rest of the expression with an 'AND'

	var partQuery = createFilterParser(filters[0]).toNoSQLQuery();
	this.appendQuery(partQuery);
	for(var i = 1; i < filters.length; i++){
		partQuery = db_help.noSQL_AND(createFilterParser(filters[i]).toNoSQLQuery());
		this.appendQuery(partQuery);
	}
}

FilterInfo.prototype.appendQuery = function(partQuery){
	'use strict';
	this.filterInfo.query += partQuery;
};

FilterInfo.prototype.filterTitle = function(){
	'use strict';
	return this.filterInfo.filterTitle;
};

FilterInfo.prototype.query = function(){
	'use strict';
	return this.filterInfo.query;
};

FilterInfo.prototype.table = function(){
	'use strict';
	return this.filterInfo.table;
};

FilterInfo.prototype.userID = function(){
	'use strict';
	return this.filterInfo.userID;
};

FilterInfo.prototype.getData = function(){
	'use strict';
	return this.filterInfo;
};
