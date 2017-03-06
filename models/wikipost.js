/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/* jshint node: true */
'use strict';


var model = module.exports;
var config = require("../config.js");

var WikiPostProps = [	"bot", "comment", "namespace", "server_name", "timestamp",
 						"title", "type", "user", "wiki"];

model.WikiPostProps = WikiPostProps;

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
	return this.prop;
};

WikiPost.prototype.setProp = function(prop, value){
	this.prop = value;
};

model.WikiPost = WikiPost;
