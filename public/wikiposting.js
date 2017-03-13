var templates;
var ID;
var fieldParsers = [];
var filterTitles = [];

function deletePost(id) {
    hidePost(id);
    propagateDelete(id);
    fixListIndexes();
}

function hidePost(id){
    $('#' + id).remove();
}

function propagateDelete(id){
    $.ajax({
        type: 'DELETE',
        url: '/profile/wikipost/delete/' + id
    });
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
	var content = { attrs: { id: wikipost.id }, text: { '.filter_title': filterTitle, '.message': wikipost.comment, '.user': wikipost.user, '.title': wikipost.title, '.position': index}};
	var wikiPostTemplate = loadTemplateTo(originalTemplates, loadSelector, content);
    $("#wikiposts").prepend( $(wikiPostTemplate) );
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
            socket.on('new_' + ID, function(wikipostInfo) {
                addWikiPost(templates, wikipostInfo.wikiData, wikipostInfo.filterTitle);
                fixListIndexes();
        	});

        	socket.on('delete_' + ID, function(wikipost) {
                hidePost(wikipost.id);
            });

        	socket.on('update_' + ID, function(wikipostInfo) {
        		addWikiPost(templates, wikipostInfo.wikiData, wikipostInfo.filterTitle);
                fixListIndexes();
            });

            getFiltersAsync(templates);
        }
    });
}

function getFiltersAsync(originalTemplates){
    $.ajax({
        type: 'GET',
        url: '/profile/getfilters',
        success: function(data) {
            filterTitles = JSON.parse(data);
            for(var i = 0; i < filterTitles.length; i++){
                var title = filterTitles[i].replace(/\s/g, "_");
                var loadSelector = 'li.currentFilter';
                var index = i;
            	var content = { attrs: { id: title }, text: { '.filter_title': filterTitles[i]} };
            	var currentFilterTemplate = loadTemplateTo(originalTemplates, loadSelector, content);
                $("#currentFilters").append( $(currentFilterTemplate) );
            }
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
            fixListIndexes();
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
    var socket = io();

    getTemplatesAsync();

    $('#wikiposts').on('click', '.deletePost', function (e) {
        var postID = $(this).parent('li')[0].id;
        deletePost(postID);
    });

    $('#wikipost_form').on('submit', function (event) {
        event.preventDefault();
        var sendData = new SendServerData();

        var title = $('#wiki_post_title').val();
        if(!title || title.trim().length === 0) {
            sendData.triggerError('The title is required');
        }
        sendData.add("title", title);
        sendData.send('/profile/addwikipost');
    });

    $('#filter_form').on('submit', function (event) {
        event.preventDefault();
        var sendData = new SendServerData();

        var title = $('#filter_title').val();
        if(!title || title.trim().length === 0) {
            sendData.triggerError('The title is required');
        }
        sendData.add("filterTitle", title);

        for (var i = 0; i < fieldParsers.length; i++) {
            fieldParsers[i].pushData(sendData);
        }

        // console.log(sendData.toString());
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
        var index = $(this).index() - 1;
        var id = $(this).parent('li')[0].id;
        $('#' + id).remove();
        $.ajax({
            type: 'DELETE',
            url: '/profile/filters/delete/' + filterTitles[index]
        });
    });

    $('#filterstuff').hide(0);

    $('#hideshowfilter').click(function(){
        $('#filterstuff').toggle("fast");
    });
});
