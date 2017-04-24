var config 				= require("../../config.js");
var boolParser 			= require("../filterparser/parsers/boolparser.js");
var multiParser 		= require("../filterparser/parsers/multipleparser.js");
var stringParser 		= require("../filterparser/parsers/stringparser.js");



var WikiPostProps = [	"bot", "comment", "namespace", "server_name", "timestamp",
 						"title", "type", "user", "wiki"];

var FieldsInfo = [	{name: "bot" , type: "boolean", message: "Check if bots are welcome"} ,
					{name: "type", type: "multiple", message: "Check the type(s) of posts you are interested in",
					 	choices: ["new", "edit", "log", "categorize", "external"]},
					{name: "title" , type: "string", message: "Match string in post title"}
				];
					// {name: "user", type: "string"},
					// {name: "wiki", type: "single", choices: ["all", "en", "common"] } ];

var model 					= module.exports;
model.FieldsInfo 			= FieldsInfo;
model.create 				= create;
model.createFilterParser	= createFilterParser;

// create a "FilterParser" based on a user "option"
function createFilterParser(filter){
	'use strict';
	switch ( filter.name ) {
		case "bot": return boolParser.create(filter);
		case "type": return multiParser.create(filter);
		case "title": return stringParser.create(filter);
		default: return null;
	}
}

function create(streamData) {
	return new WikiPost(streamData);
}

function WikiData (someData){
	'use strict';

	this.title = "No title";
	this.bot = false;
	this.comment = "No comment";
	this.namespace = 2;
	this.server_name = "commons.wikimedia.org";
	this.timestamp = 111111;
	this.type = "edit";
	this.user = "anonymous";
	this.wiki = "wikidatawiki";

	if( someData !== undefined ){
		for(var i = 0; i < WikiPostProps.length; i++){
			if( WikiPostProps[i] in someData ){
				this[WikiPostProps[i]] = someData[WikiPostProps[i]];
			}
		}
	}
}

function WikiPost(streamData){
	'use strict';
	this.data = new WikiData(streamData);
}

WikiPost.prototype.getData = function(){
	'use strict';
	return new WikiData( this.data );
};

WikiPost.prototype.getProp = function(prop){
	'use strict';
	return this.data[prop];
};

WikiPost.prototype.setProp = function(prop, value){
	'use strict';
	if( prop in this.data){
		this.data[prop] = value;
	}
};
