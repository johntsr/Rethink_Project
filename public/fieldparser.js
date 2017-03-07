function createFieldParser(field){
	switch ( field.type ) {
		case "boolean": return new BoolField(field);
		case "mulitple": return new MultipleField(field);
		default: return null;
	}
}


function BoolField (field){
	this.field = field;
}

BoolField.prototype.showChoices = function(originalTemplates){
	var boolFieldTemplate = $('li.createFilter[title="boolean"]', originalTemplates).clone();
    $(boolFieldTemplate).attr('id', this.field.name);
    $('.message', boolFieldTemplate).text( this.field.message );
    $("#createFilters").append( $(boolFieldTemplate) );
};




function MultipleField (field){
	this.field = field;
}

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
