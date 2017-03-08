var wiki = require("./wikipost.js");

var model = module.exports;
model.createFilter = createFilter;

function choiceName(fieldName, choiceIndex){
	for (var i = 0; i < wiki.FieldsInfo.length; i++) {
		if( wiki.FieldsInfo[i].name === fieldName  ){
			return "'" + wiki.FieldsInfo[i].choices[choiceIndex] + "'" ;
		}
	}
	return "BAD choiceName() call: fieldName = " + fieldName + " , choiceIndex = " + choiceIndex;
}


function noSQL_OR(expression){
	return ".or(" + expression + ")";
}

function noSQL_AND(expression){
	return ".and(" + expression + ")";
}

function createFilter(filters){
	var query = createTypeFilter(filters[0]).toNoSQLQuery();
	for(var i = 1; i < filters.length; i++){
		query += noSQL_AND(createTypeFilter(filters[i]).toNoSQLQuery());
	}
	return query;
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

FilterParser.prototype.noSQLfieldValue = function(value){
	return this.rowName() + "('" + this.filterName() + "')"  + ".eq(" + value + ")";
};





function BoolFilter (filter){
	FilterParser.call(this, filter);
}

BoolFilter.prototype = Object.create(FilterParser.prototype);
BoolFilter.prototype.constructor = BoolFilter;

BoolFilter.prototype.toNoSQLQuery = function(){
	return this.noSQLfieldValue(false);
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
			query += this.noSQLfieldValue( choice );
			break;
		}
	}

	i++;
	for(; i < this.filter.value.length; i++) {
		if( this.filter.value[i] === 'true' ){
			choice = choiceName( this.filterName() , i);
			query += noSQL_OR( this.noSQLfieldValue( choice ) );
		}
	}

	return query;
};
