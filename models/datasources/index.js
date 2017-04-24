var config 					= require("../../config.js");
var wiki 					= require("./wikipost.js");

var model 					= module.exports;
model.createFilterParser	= createFilterParser;
model.tables				= tables;
model.fieldsInfo			= fieldsInfo;
model.tablesNum				= tablesNum;

model.Tables				= 	{};
model.Tables[config.tables.wiki] = wiki;


// create a "FilterParser" based on a user "option"
function createFilterParser(table, filter){
	filter.table = table;
	return model.Tables[table].createFilterParser(filter);
}

function tables(){
	var keys = Object.keys(model.Tables);
	if( keys.constructor === Array ){
		return keys;
	}
	else{
		return [keys];
	}
}

function fieldsInfo(table){
	return model.Tables[table].FieldsInfo;
}

function tablesNum(){
	return Object.keys(model.Tables).length;
}
