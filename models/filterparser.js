var filterinfo 			= require("./filterparser/filterinfo.js");
var db_help 			= require("./filterparser/db_help.js");
var andexpression 		= require("./filterparser/expressiontypes/andexpression.js");

var model 				= module.exports;
model.createFilterInfo 	= filterinfo.create;
model.rethinkFilter 	= db_help.rethinkFilter;
model.htmlSpecialChars 	= db_help.htmlSpecialChars;
model.AndExpressions 	= andexpression.create;
