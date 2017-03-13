var templates;
var ID;
var fieldParsers = [];

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

function addWikiPost(originalTemplates, wikipost){
    var loadSelector = 'li.wikipost';
    var index = 1;
	var content = { attrs: { id: wikipost.id }, text: { '.message': wikipost.comment, '.user': wikipost.user, '.title': wikipost.title, '.position': index}};
	var wikiPostTemplate = loadTemplateTo(originalTemplates, loadSelector, content);
    $("#wikiposts").prepend( $(wikiPostTemplate) );
}

function getIDAsync(socket){
    $.ajax({
        type: 'GET',
        url: '/profile/id',
        success: function(data) {
            ID = JSON.parse(data).id;
            socket.on('new_' + ID, function(wikipost) {
                addWikiPost(templates, wikipost);
                fixListIndexes();
        	});

        	socket.on('delete_' + ID, function(wikipost) {
                hidePost(wikipost.id);
            });

        	socket.on('update_' + ID, function(wikipost) {
        		addWikiPost(templates, wikipost);
                fixListIndexes();
            });
        }
    });
}

function getTemplatesAsync(templContainer){
	$.ajax({
        type: 'GET',
        url: '/profile/templates',
        success: function(data) {
            templates = $.parseHTML(data);
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

    getIDAsync(socket);
	getTemplatesAsync();
    getWikiPostsAsync();
    getFieldsInfoAsync();

    $('#wikiposts').on('click', '.deletePost', function (e) {
        var postID = $(this).parent('li')[0].id;
        deletePost(postID);
    });

    $('#wikipost_form').on('submit', function (event) {
        event.preventDefault();
        var sendData = new SendServerData();

        var t = $('#wiki_post_title').val();
        if(!t || t.trim().length === 0) {
            data.triggerError('The title is required');
        }
        sendData.add({"title": t});
        sendData.send('/profile/addwikipost');
    });

    $('#filter_form').on('submit', function (event) {
        event.preventDefault();
        var sendData = new SendServerData();
        for (var i = 0; i < fieldParsers.length; i++) {
            fieldParsers[i].storeData(sendData);
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

    $('#filterstuff').hide(0);

    $('#hideshowfilter').click(function(){
        $('#filterstuff').toggle("fast");
    });
});
