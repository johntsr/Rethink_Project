function TypeField(field){
	this.field = field;
}

TypeField.prototype.fieldName = function(){
	return this.field.name;
};

TypeField.prototype.fieldType = function(){
	return this.field.type;
};

TypeField.prototype.fieldMessage = function(){
	return this.field.message;
};

TypeField.prototype.storeName = function(myData){
	myData.name = this.fieldName();
};

TypeField.prototype.storeType = function(myData){
	myData.type = this.fieldType();
};

TypeField.prototype.storeFilterData = function(data, myData){
	data.push(myData);
};

function createFieldParser(field){
	switch ( field.type ) {
		case "boolean"	: return new BoolField(field);
		case "multiple"	: return new MultipleField(field);
		case "string"	: return new StringField(field);
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
		this.storeType(myData);
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
	this.storeType(myData);
	myData.value = {};

	var empty = true;
	for (var i = 0; i < this.field.choices.length; i++) {
		var checked = $('#' + this.fieldName() + " #" + i + " .choiceBtn").is(":checked");
		myData.value[i] = checked;
		if( checked ){
			empty = false;
		}
	}

	if( !empty ){
		this.storeFilterData(data, myData);
	}
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



function StringField (field){
	TypeField.call(this, field);
}

StringField.prototype = Object.create(TypeField.prototype);
StringField.prototype.constructor = StringField;

StringField.prototype.pushData = function(data){
	var text = $('#' + this.fieldName() + " .match_string").val();
	if( text.trim().length !== 0 ){
		var myData = {};
		this.storeName(myData);
		this.storeType(myData);
		myData.value = text;
		this.storeFilterData(data, myData);
	}
};

StringField.prototype.showChoices = function(originalTemplates, tableName){
	var loadSelector = 'li.createFilter[title="string"]';
	var content = { attrs: { id: this.fieldName() }, text: { '.message': this.fieldMessage() }};
	var stringFieldTemplate = loadTemplateTo(originalTemplates, loadSelector, content);
    $("#createFilters_" + tableName).append( $(stringFieldTemplate) );
};
