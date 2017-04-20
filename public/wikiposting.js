var templates;
var ID;
var fieldParsers = {};
var filterIDs = [];
var prevSelected = null;
var socket = io();

var calls = {};

calls.onNew = function(postInfo) {
    addWikiPost(templates, postInfo.wikiData, postInfo.filterTitle);
};

calls.onDelete = function(post) {
    hidePost(post.wikiData.id);
};

calls.onUpdate = function(postInfo) {
    addWikiPost(templates, postInfo.wikiData, postInfo.filterTitle);
};

calls.newFilter = function(data) {
    addFilter(templates, data.filterTitle, data.id, data.table);
};

calls.deleteFilter = function(data) {
    hideFilter(data.filterTitle, data.id);
};

function decodeHtml(html) {
    var txt = document.createElement("textarea");
    txt.innerHTML = html;
    return txt.value;
}

function codeHtml(str){
	var map = {
		'&': '&amp;',
		'<': '&lt;',
		'>': '&gt;',
		'"': '&quot;',
		"'": '&#039;'
	};
	return str.replace(/[&<>"']/g, function(m) { return map[m]; });
}

function hidePost(id){
    $('#' + id).remove();
    fixListIndexes();
}

function fixListIndexes(){
    $('#wikiposts li').each(function() {
        var i = $(this).index() + 1;
        $(this).find('.position').text( i );
    });
}

function addWikiPost(originalTemplates, wikipost, filterTitle){
    if(!filterTitle){
        filterTitle = '';
    }

    var loadSelector = 'li.wikipost';
    var index = 1;
	var content = { attrs: { id: wikipost.id }, text: { '.filter_title': decodeHtml(filterTitle),
														'.message': decodeHtml(wikipost.comment),
														'.user': decodeHtml(wikipost.user),
														'.title': decodeHtml(wikipost.title),
														'.position': index}};
	var wikiPostTemplate = loadTemplateTo(originalTemplates, loadSelector, content);
    $("#wikiposts").prepend( $(wikiPostTemplate) );
    fixListIndexes();
}

function getTemplatesAsync(){
	$.ajax({
        type: 'GET',
        url: '/profile/templates',
        success: function(data) {
            templates = $.parseHTML(data);
            getWikiPostsAsync();
            getFieldsInfoAsync();
        }
    });
}

function addFilter(originalTemplates, filterTitle, filterID, filterTable){
    var loadSelector = 'li.currentFilter';
    var content = {
        attrs: { id: filterID },
        text: {
            '.filter_title': decodeHtml(filterTitle),
            '.filter_table': "(source: " + decodeHtml(filterTable) + ")",
        }
    };
    var currentFilterTemplate = loadTemplateTo(originalTemplates, loadSelector, content);
    $("#currentFilters").append( $(currentFilterTemplate) );
    filterIDs.push(filterID);
}

function getFiltersAsync(originalTemplates, table){
    $.ajax({
        type: 'POST',
        url: '/profile/getfilters',
        data: {table: table},
        success: function(data) {
            var filterData = JSON.parse(data);
            for(var i = 0; i < filterData.length; i++){
                addFilter(originalTemplates, filterData[i].title, filterData[i].id, table);
            }
        }
    });
}

function hideFilter(filterTitle, filterID){
    $('#' + filterID).remove();
    var index = filterIDs.indexOf(filterID);
    filterIDs.splice(index, 1);
}

function deleteFilter(filterID){
    $.ajax({
        type: 'DELETE',
        url: '/profile/filters/delete/',
        data: {
            id: filterID
        }
    });
}

function getWikiPostsAsync(){
    $.ajax({
        type: 'GET',
        url: '/profile/getwikiposts',
        success: function(data) {
            var wikiposts = JSON.parse(data);
            for (var i = 0; i < wikiposts.length; i++) {
                addWikiPost(templates, wikiposts[i]);
            }
        }
    });
}

function getFieldsInfoAsync(){
    $.getScript("fieldparser.js", function(){
        $.ajax({
            type: 'GET',
            url: '/profile/fieldsInfo',
            success: function(data) {
                data = JSON.parse(data);
                ID = data.id;
                var tableInfo = data.tableInfo;

                socket.on('newFilter_' + ID, calls.newFilter);
                socket.on('deleteFilter_' + ID, calls.deleteFilter);

				for (var tableName in tableInfo) {
					var fields = tableInfo[tableName];
                    setupTable(tableName, fields);
				}
            }
        });
    });
}

function setupTable(tableName, fields){
    socket.on('new' + tableName + '_' + ID, calls.onNew);
    socket.on('delete' + tableName + '_' + ID, calls.onDelete);
    socket.on('update' + tableName + '_' + ID, calls.onUpdate);

    getFiltersAsync(templates, tableName);
    setupFilterPanel(tableName);
    setupFilterParsers(tableName, fields);
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

$(document).ready(function () {
    getTemplatesAsync();

    $('#dbTables').on('click', function (event) {
        event.preventDefault();

        if(prevSelected && prevSelected !== $('#dbTables').val()){
            $("#createFilters_" +  prevSelected).toggle("fast");
        }
        $("#createFilters_" +  $('#dbTables').val()).toggle("fast");

        prevSelected = $('#dbTables').val();
    });

    $('#filter_form').on('submit', function (event) {
        event.preventDefault();
        var sendData = new SendServerData();

        var title = $('#filter_title').val();
        if(!title || title.trim().length === 0) {
            sendData.triggerError('The title is required');
        }
        sendData.add("filterTitle", codeHtml(title));

        var table = $('#dbTables').val();
        sendData.add("table", table);

        for (var i = 0; i < fieldParsers[table].length; i++) {
            fieldParsers[table][i].pushData(sendData);
        }

        sendData.send('/profile/addfilter',
            function afterAddition(data){
                var success = JSON.parse(data).success;
                if( success){
                    $('#filterResponse').text("Filter successfully added!");
                }
                else{
                    $('#filterResponse').text("Filter wasn't added, it already exists!");
                }
                var milliseconds = 3000;
                setTimeout(function(){ $('#filterResponse').text(""); }, milliseconds);
            });
    });

    $('#currentFilters').on('click', '.currentFilter', function (e) {
        var index = $(this).index();
        deleteFilter(filterIDs[index]);
    });

    $('#filterstuff').hide(0);

    $('#hideshowfilter').click(function(){
    	$('#filterstuff').toggle("fast");
    });
});
