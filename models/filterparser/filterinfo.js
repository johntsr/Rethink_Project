var db_help 			= require("./db_help.js");
var sources 			= require("../datasources/index.js");

var FILTER_STATUS = {
  PLAY 		: 0,
  PAUSE		: 1,
  DELETE 	: 2
};

var model 				= module.exports;
model.create 			= create;
model.toggleStatus		= toggleStatus;
model.STATUS 			= FILTER_STATUS;


function create(_userID, filterData){
	'use strict';
	return new FilterInfo(_userID, filterData);
}

function toggleStatus(status){
	switch (status) {
		case FILTER_STATUS.PLAY		: return FILTER_STATUS.PAUSE;
		case FILTER_STATUS.PAUSE	: return FILTER_STATUS.PLAY;
		default: console.log("Error in toggle!"); return undefined;
	}
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

	this.filterInfo.squash = 2.0;

	var unit = filterData.frequency.time.charAt(0);
	var time = filterData.frequency.time.substring(1);
	var num = filterData.frequency.count;
	this.filterInfo.frequency = { count: num, seconds: time * this.unitMap[unit] };

	if( !filterData.status ){
		this.filterInfo.status = FILTER_STATUS.PLAY;
	}

	// first, get the options of the filter
	// ie. the column names of the matching table are meant, as defined in "FieldsInfo" table (models/wikipost.js)
	var filters = filterData.filterOptions;
  for(var i = 0; i < filters.length; i++){
    filters[i].table = this.filterInfo.table;
  }

	// reg. expr. of the query: "(expression)('AND'(expression))*"
	// so, first apply the expression (column constraint)
	// and, in the loop, append the rest of the expression with an 'AND'

	var partQuery = sources.createFilterParser(filters[0]).toNoSQLQuery();
	this.appendQuery(partQuery);
	for(var i = 1; i < filters.length; i++){
		partQuery = db_help.noSQL_AND(sources.createFilterParser(filters[i]).toNoSQLQuery());
		this.appendQuery(partQuery);
	}
}

FilterInfo.prototype.unitMap = {
	"m" : 60,
	"h" : 60*60,
	"d" : 60*60*24
};

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
