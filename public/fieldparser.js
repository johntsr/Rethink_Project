function TypeField(field){
	this.field = field;
}

TypeField.prototype.fieldName = function(){
	return this.field.name;
};

TypeField.prototype.error = function(data){
	return data.error.triggered;
};

function createFieldParser(field){
	switch ( field.type ) {
		case "boolean": return new BoolField(field);
		case "mulitple": return new MultipleField(field);
		default: return null;
	}
}


function BoolField (field){
	TypeField.call(this, field);
}

BoolField.prototype = Object.create(TypeField.prototype);
BoolField.prototype.constructor = BoolField;

BoolField.prototype.storeData = function(data){

	if( this.error(data) ){
		return;
	}

	if( $('#' + this.field.name + " .choice").is(":checked") ){
		data[this.field.name] = true;
	}
	else{
		data[this.field.name] = false;
	}
};

BoolField.prototype.showChoices = function(originalTemplates){
	var boolFieldTemplate = $('li.createFilter[title="boolean"]', originalTemplates).clone();
    $(boolFieldTemplate).attr('id', this.field.name);
    $('.message', boolFieldTemplate).text( this.field.message );
    $("#createFilters").append( $(boolFieldTemplate) );
};




function MultipleField (field){
	TypeField.call(this, field);
}

MultipleField.prototype = Object.create(TypeField.prototype);
MultipleField.prototype.constructor = MultipleField;

MultipleField.prototype.storeData = function(data){

	if( this.error(data) ){
		return;
	}

	var myData = {};

	var error = true;
	for (var i = 0; i < this.field.choices.length; i++) {
		if( $('#' + this.field.name + " #" + i + " .choice").is(":checked") ){
			myData[i] = true;
			error = false;
		}
		else{
			myData[i] = false;
		}
	}

	if( error ){
		data.error.triggered = true;
		data.error.description = "In field <<" + this.field.name + ">>, at least 1 option must be selected!";
	}
	else{
		data[this.field.name] = myData;
	}

};

MultipleField.prototype.showChoices = function(originalTemplates){

	var multipleFieldTemplate = $('li.createFilter[title="multiple"]', originalTemplates).clone();

    $(multipleFieldTemplate).attr('id', this.field.name);
    $('.message', multipleFieldTemplate).text( this.field.message );

	for (var i = 0; i < this.field.choices.length; i++) {
		var choiceTemplate = $('#multiple_choice_template', multipleFieldTemplate).clone();
		$(choiceTemplate).attr('id', i);
		$(choiceTemplate).removeAttr('hidden');
    	$('.description', choiceTemplate).text( this.field.choices[i] );
    	$(multipleFieldTemplate).append( $(choiceTemplate) );
	}

    $("#createFilters").append( $(multipleFieldTemplate) );
};
