function SendServerData(){
	this.data = {};
	this.errorInfo = { error: { triggered: false, description: ""} };
}

SendServerData.prototype.toString = function(){
	return JSON.stringify(this.data);
};

SendServerData.prototype.getData = function(){
	return this.data;
};

SendServerData.prototype.triggerError = function(description){
	this.errorInfo.triggered = true;
	this.errorInfo.description = description;
};

SendServerData.prototype.error = function(){
	return this.errorInfo.triggered;
};

SendServerData.prototype.add = function(newLabel, newData){
	if( !this.error() ){
		this.data[newLabel] = newData;
	}
};

SendServerData.prototype.send = function(serverURL){
	if( this.error() ){
		alert(this.errorInfo.description);
	}
	else{
		$.ajax({
			type: 'POST',
			url: serverURL,
			data: {
				userData: this.data
			},
			success: function(data) {}
		});
	}
};




function TypeField(field){
	this.field = field;
}

TypeField.prototype.fieldName = function(){
	return this.field.name;
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
	var checked = $('#' + this.field.name + " .choice").is(":checked");
	data.add(this.field.name, checked);
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
	var myData = {};

	var error = true;
	for (var i = 0; i < this.field.choices.length; i++) {
		var checked = $('#' + this.field.name + " #" + i + " .choice").is(":checked");
		myData[i] = checked;
		if( checked ){
			error = false;
		}
	}

	if( error ){
		data.triggerError("In field <<" + this.field.name + ">>, at least 1 option must be selected!");
	}

	data.add(this.field.name, myData);
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
