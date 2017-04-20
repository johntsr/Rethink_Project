var generic 	= require("./genericparser.js");
var db_help 	= require("../db_help.js");
var config 		= require("../../../config.js");

var model 		= module.exports;
model.create	= create;

function create(filter){
	'use strict';
	return new MultipleFilter(filter);
}

// a "MultipleFilter" is a "GenericParser" on an enum column, whose value may be 1 of many
// eg. pet = {dog, cat, parrot, snake}, and "MultipleFilter" demands 1 of {dog, parrot, snake}
function MultipleFilter (filter){
	'use strict';
	generic.GenericParser.call(this, filter);
}

MultipleFilter.prototype = Object.create(generic.GenericParser.prototype);
MultipleFilter.prototype.constructor = MultipleFilter;

// get the next index whose enum values is acceptable
// { name: "pet", value: [true, false, true, true]}, 0 -> 2 -> 3
MultipleFilter.prototype.nextIndex = function(currentIndex){
	'use strict';

	if( !currentIndex ){		// if not specified
		currentIndex = -1;		// start from the beginning
	}

	var i = currentIndex + 1;					// start from the next position
	for (; i < this.filter.value.length; i++) {	// iterate the array of values
		if( this.filter.value[i] === 'true' ){	// if it's ok
			return i;							// return it's index
		}
	}
	return this.filter.value.length;			// nothing was found, return index out of range
};

// demand that this column has 1 of the permitted values
MultipleFilter.prototype.toNoSQLQuery = function(){
	'use strict';
	var query = "";
	var choice = "";

	// now, filter looks like this:
	// { name: "pet", value: [true, false, true, true]}
	// meaning (remember {dog, cat, parrot, snake}): dog or parrot or snake

	// so iterate over the "true" fields only
	// and demand at least 1 of them (so, append them with 'OR')
	var i = this.nextIndex();
	var table = config.tables.wiki;
	choice = db_help.choiceName(table, this.filterName() , i);
	query += this.genericOp("=", choice );

	for( i++; i < this.filter.value.length; i = this.nextIndex(i) ) {
		choice = db_help.choiceName(table, this.filterName() , i);
		query += db_help.noSQL_OR( this.genericOp("=", choice ) );
	}

	return query;
};
