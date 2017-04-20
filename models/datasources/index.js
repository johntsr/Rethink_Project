var config 					= require("../../config.js");
var wiki 					= require("./wikipost.js");

var model 					= module.exports;
model[config.tables.wiki]	= wiki;
