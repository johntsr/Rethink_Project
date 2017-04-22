function loadTemplateTo(originalTemplates, loadSelector, content){
	var template = $(loadSelector, originalTemplates).clone();

	if( "attrs" in content){
		var attrValues = content.attrs;
		for (var attr in attrValues) {
			$(template).attr(attr, attrValues[attr]);
		}
	}

	if( "text" in content){
		var textValues = content.text;
		for (var text in textValues) {
	    	$(text, template).text( textValues[text] );
		}
	}

	return template;
}
