/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/* jshint node: true */
'use strict';


var model = module.exports;
var config = require("../config.js");
var filterparser = require("./filterparser.js");

var WikiPostProps = [	"bot", "comment", "namespace", "server_name", "timestamp",
 						"title", "type", "user", "wiki"];

var FieldsInfo = [	{name: "bot" , type: "boolean", message: "Check if bots are welcome"} ,
					{name: "type", type: "mulitple", message: "Check the type(s) of posts you are interested in",
					 	choices: ["new", "edit", "log", "categorize", "external"]},
				];
					// {name: "user", type: "string"},
					// {name: "wiki", type: "single", choices: ["all", "en", "common"] } ];

model.WikiPostProps = WikiPostProps;
model.FieldsInfo = FieldsInfo;

function WikiData (someData){

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

var WikiPost = function (streamData){
	this.data = new WikiData(streamData);
};

WikiPost.prototype.getData = function(){
	return new WikiData( this.data );
};

WikiPost.prototype.getProp = function(prop){
	return this.data[prop];
};

WikiPost.prototype.setProp = function(prop, value){
	if( prop in this.data){
		this.data[prop] = value;
	}
};

model.WikiPost = WikiPost;
