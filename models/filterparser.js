function FilterParser(filter){
	this.filter = filter;
}

TypeField.prototype.fieldName = function(){
	return this.field.name;
};

function createFilterParser(field){
	switch ( field.type ) {
		case "boolean": return new BoolField(field);
		case "mulitple": return new MultipleField(field);
		default: return null;
	}
}
