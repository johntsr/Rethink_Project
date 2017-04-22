var templates;
var ID;
var fieldParsers = {};
var filterIDs = [];
var prevSelected = null;
var socket = io();

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

$.getMultiScripts = function(arr) {
    var _arr = $.map(arr, function(scr) {
        return $.getScript( scr );
    });

    _arr.push($.Deferred(function( deferred ){
        $( deferred.resolve );
    }));

    return $.when.apply($, _arr);
};

$(document).ready(function () {
	var script_arr = [
		"client/fieldparsers.js",
	    "client/click.js",
		"client/loadtemplate.js",
	    "client/view.js",
		"server/filters.js",
	    "server/getasync.js",
	  	"server/sendserver.js",
	    "calls.js"
	];

	$.getMultiScripts(script_arr).done(function() {
	    $.ajax({
	        type: 'GET',
	        url: '/profile/templates',
	        success: function(data) {
	            templates = $.parseHTML(data);
	            getPostsAsync();
	            getFieldsInfoAsync();
	        }
	    });
	});
});
