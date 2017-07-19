var filterinfo 			= require("./filterinfo.js");
var db_help 			= require("./db_help.js");
var andexpression 		= require("./expressiontypes/andexpression.js");
var orexpression 		= require("./expressiontypes/orexpression.js");

var model 				= module.exports;
model.createFilterInfo 	= filterinfo.create;
model.filterStatus 		= filterinfo.STATUS;
model.toggleStatus 		= filterinfo.toggleStatus;
model.rethinkFilter 	= db_help.rethinkFilter;
model.htmlSpecialChars 	= db_help.htmlSpecialChars;
model.AndExpressions 	= andexpression.create;
model.OrExpressions 	= orexpression.create;
