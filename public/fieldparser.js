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

BoolField.prototype.showChoices = function(){
	 $("#createFilters").append("<li class='createFilter' id='" + this.field.name + "'>" +
			 "<span class='position'>" + ($( "li.createFilter" ).length+1) + "</span>" +
			 "<input class='choice' type='checkbox' value='true' /> " + this.field.message + " <br> " +
			 "</li> <br>");
};




function MultipleField (field){
	this.field = field;
}

MultipleField.prototype.showChoices = function(){
	var htmlString = "<li class='createFilter' id='" + this.field.name + "'>";
	htmlString += "<span class='position'>" + ($( "li.createFilter" ).length+1) + "</span>";
	for (var i = 0; i < this.field.choices.length; i++) {
		htmlString += "<input class='choice' type='checkbox' value='true'> " + this.field.choices[i] + "<br>";
	}
	htmlString += "</li>";
	$("#createFilters").append(htmlString);
};
