function TypeField(field){
	this.field = field;
}

TypeField.prototype.fieldName = function(){
	return this.field.name;
};

TypeField.prototype.fieldMessage = function(){
	return this.field.message;
};

TypeField.prototype.storeName = function(myData){
	myData.name = this.fieldName();
};

TypeField.prototype.filterTag = function(){
	return "filterOptions";
};

TypeField.prototype.storeFilterData = function(data, myData){
	data.push(this.filterTag(), myData);
};

function createFieldParser(field){
	switch ( field.type ) {
		case "boolean": return new BoolField(field);
		case "multiple": return new MultipleField(field);
		default: return null;
	}
}



function BoolField (field){
	TypeField.call(this, field);
}

BoolField.prototype = Object.create(TypeField.prototype);
BoolField.prototype.constructor = BoolField;

BoolField.prototype.pushData = function(data){
	var checked = $('#' + this.fieldName() + " .choiceBtn").is(":checked");
	if( !checked ){
		var myData = {};
		this.storeName(myData);
		myData.value = checked;
		this.storeFilterData(data, myData);
	}
};

BoolField.prototype.showChoices = function(originalTemplates, tableName){
	var loadSelector = 'li.createFilter[title="boolean"]';
	var content = { attrs: { id: this.fieldName() }, text: { '.message': this.fieldMessage() }};
	var boolFieldTemplate = loadTemplateTo(originalTemplates, loadSelector, content);
    $("#createFilters_" + tableName).append( $(boolFieldTemplate) );
};






function MultipleField (field){
	TypeField.call(this, field);
}

MultipleField.prototype = Object.create(TypeField.prototype);
MultipleField.prototype.constructor = MultipleField;

MultipleField.prototype.pushData = function(data){
	var myData = {};
	this.storeName(myData);
	myData.value = {};

	var error = true;
	for (var i = 0; i < this.field.choices.length; i++) {
		var checked = $('#' + this.fieldName() + " #" + i + " .choiceBtn").is(":checked");
		myData.value[i] = checked;
		if( checked ){
			error = false;
		}
	}

	if( error ){
		data.triggerError("In field <<" + this.fieldName() + ">>, at least 1 option must be selected!");
	}

	this.storeFilterData(data, myData);
};

MultipleField.prototype.showChoices = function(originalTemplates, tableName){
	var loadSelector = 'li.createFilter[title="multiple"]';
	var content = { attrs: { id: this.fieldName() }, text: { '.message': this.fieldMessage() }};
	var multipleFieldTemplate = loadTemplateTo(originalTemplates, loadSelector, content);

	loadSelector = '#list_choice_template';
	content = { attrs: { id: this.fieldName() + "-list" }};
	choiceTemplate = loadTemplateTo(multipleFieldTemplate, loadSelector, content);

	for (var i = 0; i < this.field.choices.length; i++) {
		loadSelector = '#choice_template';
		content = { attrs: {id: i}, text: { '.description': this.field.choices[i] }};
		var choice = loadTemplateTo(choiceTemplate, loadSelector, content);
		$(choiceTemplate).append( $(choice) );
	}

	$('#choice_template', choiceTemplate).remove();
	$('#list_choice_template', multipleFieldTemplate).remove();

	$(multipleFieldTemplate).append( $(choiceTemplate) );
    $("#createFilters_" + tableName).append( $(multipleFieldTemplate) );
};
