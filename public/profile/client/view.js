function hidePost(id){
    $('#' + id).remove();
    fixListIndexes();
}

function fixListIndexes(){
    $('#posts li').each(function() {
        var i = $(this).index() + 1;
        $(this).find('.position').text( i );
    });
}

function addPost(originalTemplates, post, filterTitle){
    if(!filterTitle){
        filterTitle = '';
    }

    var loadSelector = 'li.post';
    var index = 1;
	var content = { attrs: { id: post.id }, text: { '.filter_title': decodeHtml(filterTitle),
														'.message': decodeHtml(post.comment),
														'.user': decodeHtml(post.user),
														'.title': decodeHtml(post.title),
														'.position': index}};
	var postTemplate = loadTemplateTo(originalTemplates, loadSelector, content);
    $("#posts").prepend( $(postTemplate) );
    fixListIndexes();
}

function addFilter(originalTemplates, filterData){
    var loadSelector = 'li.currentFilter';
    var content = {
        attrs: { id: filterData.id },
        text: {
            '.filter_title': decodeHtml(filterData.title),
            '.filter_table': "(source: " + decodeHtml(filterData.table) + ")",
        }
    };
    var currentFilterTemplate = loadTemplateTo(originalTemplates, loadSelector, content);
    if( filterData.status ===  FILTER_STATUS.PLAY ){
		$('.playFilter', currentFilterTemplate).hide();
    }
    else{
		$('.pauseFilter', currentFilterTemplate).hide();
    }
    $("#currentFilters").append( $(currentFilterTemplate) );
    filterIDs.push(filterData.id);
}

function hideFilter(filterID){
    $('#' + filterID).remove();
    var index = filterIDs.indexOf(filterID);
    filterIDs.splice(index, 1);
}

function setupFilterPanel(tableName){
    $('#dbTables').append($("<option></option>").attr("value",tableName).text(tableName));

    var loadSelector = '#createFiltersTemplate';
    var content = { attrs: { id: "createFilters_" +  tableName} };
    var tableTemplate = loadTemplateTo(templates, loadSelector, content);
    $("#createFilters").append( $(tableTemplate) );
    $("#createFilters_" +  tableName).hide(0);
}

function setupFilterParsers(tableName, fields){
    fieldParsers[tableName] = [];
    for(var i = 0; i < fields.length; i++){
        var temp = createFieldParser(fields[i]);
        temp.showChoices(templates, tableName);
        fieldParsers[tableName].push(temp);
    }
}
