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

  var filterAST = filterData.filterOptions;
  this.filterInfo.query = this.astToString(filterAST);
}

FilterInfo.prototype.unitMap = {
	"m" : 60,
	"h" : 60*60,
	"d" : 60*60*24
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

FilterInfo.prototype.astToString = function(filterAST){
  var type = filterAST.type;
  var term1 = filterAST.left;
  var term2 = filterAST.right;

  if( type === 'and' ){
    return this.astToString(term1) + db_help.noSQL_AND(this.astToString(term2));
  }
  else if ( type === 'or' ){
    return this.astToString(term1) + db_help.noSQL_OR(this.astToString(term2));
  }
  else if ( type === 'not' ){
    return db_help.noSQL_NOT(this.astToString(term1));
  }
  else{
    return sources.createFilterParser(this.table(), term1).toNoSQLQuery();
  }
};
