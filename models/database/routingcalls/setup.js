var onlogin 		= require("./setup/onlogin.js");
var onlogout 		= require("./setup/onlogout.js");
var garbageSelector = require("./setup/selectors.js").garbageSelector;
var w 				= require("../operations/index.js");
var broadcast 		= require('../../../config').tables.broadcast;
var getTime 		= require("./broadcastdata.js").getTime;
var sources = require("../../datasources/index.js");


var model 			= module.exports;
model.setup		 	= setup;
model.loginUser	 	= onlogin.loginUser;
model.logoutUser	= onlogout.logoutUser;

function setup() {
	var filter = "true";

	function clearBroadcasts(){
		w.Connect( new w.DeleteByFilter(broadcast, filter));
	}

	clearBroadcasts();
	var secondsInDay = 60 * 60 * 24;

	filter = garbageSelector(secondsInDay);
	setInterval(clearBroadcasts, 2 * secondsInDay * 1000);
	sources.init();
}
