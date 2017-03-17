/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/* jshint node: true */
'use strict';

var wiki = require("./wikipost.js");

var model = module.exports;
model.createFilter = createFilter;
model.FilterParser = FilterParser;
model.AndFilter = AndFilter;

function escape(str){
	return str.replace(/\\/g, "\\\\")
	   .replace(/\$/g, "\\$")
	   .replace(/'/g, "\\'")
	   .replace(/"/g, "\\\"");
}

function stringify(value){
	if(typeof(value) == 'string'){
		return "'" + escape(value) + "'";
	}
	else{
		return value + "";
	}
}


function choiceName(fieldName, choiceIndex){
	for (var i = 0; i < wiki.FieldsInfo.length; i++) {
		if( wiki.FieldsInfo[i].name === fieldName  ){
			return wiki.FieldsInfo[i].choices[choiceIndex];
		}
	}
	return "BAD choiceName() call: fieldName = " + stringify(fieldName) + " , choiceIndex = " + choiceIndex;
}


function noSQL_OR(expression){
	return ".or(" + expression + ")";
}

function noSQL_AND(expression){
	return ".and(" + expression + ")";
}

function FilterInfo(_userID, filterData){		// as got from client
	this.filterInfo = {};
	this.filterInfo.filterTitle = filterData.filterTitle;
	this.filterInfo.query = "";
	this.filterInfo.table = filterData.table;
	this.filterInfo.userID = _userID;

	var filters = filterData.filterOptions;
	var partQuery = createTypeFilter(filters[0]).toNoSQLQuery();
	this.appendQuery(partQuery);
	for(var i = 1; i < filters.length; i++){
		partQuery = noSQL_AND(createTypeFilter(filters[i]).toNoSQLQuery());
		this.appendQuery(partQuery);
	}
}

FilterInfo.prototype.appendQuery = function(partQuery){
	this.filterInfo.query += partQuery;
};

FilterInfo.prototype.filterTitle = function(){
	return this.filterInfo.filterTitle;
};

FilterInfo.prototype.query = function(){
	return this.filterInfo.query;
};

FilterInfo.prototype.table = function(){
	return this.filterInfo.table;
};

FilterInfo.prototype.userID = function(){
	return this.filterInfo.userID;
};

FilterInfo.prototype.getData = function(){
	return this.filterInfo;
};

function createFilter(userID, data){
	return new FilterInfo(userID, data);
}

function createTypeFilter(filter){
	switch ( filter.name ) {
		case "bot": return new BoolFilter(filter);
		case "type": return new MultipleFilter(filter);
		default: return null;
	}
}





function FilterParser(filter){
	this.filter = filter;
}

FilterParser.prototype.filterName = function(){
	return this.filter.name;
};

FilterParser.prototype.rowName = function(){
	return "r.row";
};

FilterParser.prototype.eqValue = function(value){
	return "r.row(" + stringify(this.filterName()) + ")"  + ".eq(" + stringify(value) + ")";
};



function BoolFilter (filter){
	FilterParser.call(this, filter);
}

BoolFilter.prototype = Object.create(FilterParser.prototype);
BoolFilter.prototype.constructor = BoolFilter;

BoolFilter.prototype.toNoSQLQuery = function(){
	return this.eqValue(false);
};


function MultipleFilter (filter){
	FilterParser.call(this, filter);
}

MultipleFilter.prototype = Object.create(FilterParser.prototype);
MultipleFilter.prototype.constructor = MultipleFilter;

MultipleFilter.prototype.toNoSQLQuery = function(){
	var query = "";
	var choice = "";

	var i = 0;
	for (; i < this.filter.value.length; i++) {
		if( this.filter.value[i] === 'true' ){
			choice = choiceName( this.filterName() , i);
			query += this.eqValue( choice );
			break;
		}
	}

	i++;
	for(; i < this.filter.value.length; i++) {
		if( this.filter.value[i] === 'true' ){
			choice = choiceName( this.filterName() , i);
			query += noSQL_OR( this.eqValue( choice ) );
		}
	}

	return query;
};





function AndFilter (filterArray){
	this.filterArray = filterArray;
}

AndFilter.prototype.toNoSQLQuery = function(){
	var query = new FilterParser(this.filterArray[0]).eqValue(this.filterArray[0].value);
	for(var i = 1; i < this.filterArray.length; i++) {
		query += noSQL_AND( new FilterParser(this.filterArray[i]).eqValue(this.filterArray[i].value) );
	}
	return query;
};
