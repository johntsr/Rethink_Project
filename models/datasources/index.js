var config 					= require("../../config.js");
var w 							= require("../database/operations/index.js");

var model 					= module.exports;
model.init					= init;
model.addTable			= addTable;
model.createFilterParser	= createFilterParser;
model.tables					= tables;
model.fieldsInfo			= fieldsInfo;
model.tablesNum				= tablesNum;
model.addData				= addData;

model.Tables				= 	{};

function init(){
	w.Connect(
		new w.GetAll(config.tables.sources, function (cursor){
				w.cursorToArray(cursor, function (results){
					for (var i = 0; i < results.length; i++) {
						model.Tables[results[i].table] = results[i].fieldsInfo;
					}
				});
		})
	);
}

function addTable(tableName, fieldsInfo){
	if( model.Tables[tableName] ){
		return;
	}

	w.Connect( new w.Insert(config.tables.sources, {table: tableName, fieldsInfo: fieldsInfo}, {},
		function (result) {
			model.Tables[tableName] = fieldsInfo;
			w.Connect(
	      new w.CreateTable(tableName)
	    );
		})
	);
}

function addData(tableName, data){
	if( !model.Tables[tableName] ){
		return;
	}

	w.Connect(
		new w.Insert(tableName, data)
	);
}

// create a "FilterParser" based on a user "option"
function createFilterParser(filter){
	'use strict';
	switch ( filter.type ) {
		case "boolean": return boolParser.create(filter);
		case "multiple": return multiParser.create(filter);
		case "string": return stringParser.create(filter);
		default: return null;
	}
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
	return model.Tables[table];
}

function tablesNum(){
	return tables().length;
}
