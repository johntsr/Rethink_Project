var templates;
var ID;
var fieldParsers = [];
var filterIDs = [];

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
            getIDAsync();
            getWikiPostsAsync();
            getFieldsInfoAsync();
        }
    });
}

function getIDAsync(){
    var socket = io();
    $.ajax({
        type: 'GET',
        url: '/profile/id',
        success: function(data) {
            ID = JSON.parse(data).id;
            socket.on('newWiki_' + ID, function(wikipostInfo) {
                addWikiPost(templates, wikipostInfo.wikiData, wikipostInfo.filterTitle);
        	});

        	socket.on('deleteWiki_' + ID, function(wikipost) {
                hidePost(wikipost.wikiData.id);
            });

        	socket.on('updateWiki_' + ID, function(wikipostInfo) {
        		addWikiPost(templates, wikipostInfo.wikiData, wikipostInfo.filterTitle);
            });

            socket.on('newFilter_' + ID, function(data) {
                addFilter(templates, data.filterTitle, data.id);
        	});

        	socket.on('deleteFilter_' + ID, function(data) {
                hideFilter(data.filterTitle, data.id);
            });

            getFiltersAsync(templates);
        }
    });
}

function addFilter(originalTemplates, filterTitle, filterID){
    var loadSelector = 'li.currentFilter';
    var content = { attrs: { id: filterID }, text: { '.filter_title': decodeHtml(filterTitle)} };
    var currentFilterTemplate = loadTemplateTo(originalTemplates, loadSelector, content);
    $("#currentFilters").append( $(currentFilterTemplate) );
    filterIDs.push(filterID);
}

function getFiltersAsync(originalTemplates){
    $.ajax({
        type: 'POST',
        url: '/profile/getfilters',
        data: {table: "Wiki"},
        success: function(data) {
            var filterData = JSON.parse(data);
            for(var i = 0; i < filterData.length; i++){
                addFilter(originalTemplates, filterData[i].title, filterData[i].id);
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
                var fields = JSON.parse(data);
                for(var i = 0; i < fields.length; i++){
                    var temp = createFieldParser(fields[i]);
                    temp.showChoices(templates);
                    fieldParsers.push(temp);
                }
            }
        });
    });
}

$(document).ready(function () {
    getTemplatesAsync();

    $('#filter_form').on('submit', function (event) {
        event.preventDefault();
        var sendData = new SendServerData();

        var title = $('#filter_title').val();
        if(!title || title.trim().length === 0) {
            sendData.triggerError('The title is required');
        }
        sendData.add("filterTitle", codeHtml(title));
        sendData.add("table", "Wiki");

        for (var i = 0; i < fieldParsers.length; i++) {
            fieldParsers[i].pushData(sendData);
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
