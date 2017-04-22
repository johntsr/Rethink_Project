var templates;
var ID;
var fieldParsers = {};
var filterIDs = [];
var prevSelected = null;
var socket = io();

var FILTER_STATUS = {
  PLAY 		: 0,
  PAUSE		: 1,
  DELETE 	: 2
};


var calls = {};

calls.onNew = function(postInfo) {
    addPost(templates, postInfo.data, postInfo.filterTitle);
};

calls.onDelete = function(post) {
    hidePost(post.data.id);
};

calls.onUpdate = function(postInfo) {
    addPost(templates, postInfo.data, postInfo.filterTitle);
};

calls.newFilter = function(data) {
    addFilter(templates, data);
};

calls.deleteFilter = function(data) {
    hideFilter(data.id);
};

calls.statusFilter = function(data) {
	if( data.status ===  FILTER_STATUS.PLAY ){
		console.log("play!");
		$('#' + data.id + " .playFilter").hide();
		$('#' + data.id + " .pauseFilter").show();
    }
    else{
		console.log("pause!");
		$('#' + data.id + " .playFilter").show();
		$('#' + data.id + " .pauseFilter").hide();
    }
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

function getTemplatesAsync(){
	$.ajax({
        type: 'GET',
        url: '/profile/templates',
        success: function(data) {
            templates = $.parseHTML(data);
            getPostsAsync();
            getFieldsInfoAsync();
        }
    });
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

function getFiltersAsync(originalTemplates, table){
    $.ajax({
        type: 'POST',
        url: '/profile/getfilters',
        data: {table: table},
        success: function(data) {
            var filterData = JSON.parse(data);
            for(var i = 0; i < filterData.length; i++){
                addFilter(originalTemplates, filterData[i]);
            }
        }
    });
}

function hideFilter(filterID){
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

function pauseFilter(filterID){
    $.ajax({
        type: 'POST',
        url: '/profile/filters/pause/',
        data: {
            id: filterID
        }
    });
}

function playFilter(filterID){
    $.ajax({
        type: 'POST',
        url: '/profile/filters/play/',
        data: {
            id: filterID
        }
    });
}

function getPostsAsync(){
    $.ajax({
        type: 'GET',
        url: '/profile/getposts',
        success: function(data) {
            var posts = JSON.parse(data);
            for (var i = 0; i < posts.length; i++) {
                addPost(templates, posts[i]);
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
                socket.on('statusFilter_' + ID, calls.statusFilter);

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


    $('#currentFilters').on('click', '.deleteFilter', function (e) {
        var index = $(this).parent().index();
        deleteFilter(filterIDs[index]);
    });

	$('#currentFilters').on('click', '.pauseFilter', function (e) {
        var index = $(this).parent().index();
        pauseFilter(filterIDs[index]);
    });

	$('#currentFilters').on('click', '.playFilter', function (e) {
        var index = $(this).parent().index();
        playFilter(filterIDs[index]);
    });


    $('#filterstuff').hide();
    $('#hideshowfilter').click(function(){
    	$('#filterstuff').toggle("fast");
    });
});
