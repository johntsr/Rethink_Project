var onlogin 		= require("./setup/onlogin.js");
var onlogout 		= require("./setup/onlogout.js");
var garbageSelector = require("./setup/selectors.js").garbageSelector;
var w 				= require("../operations/index.js");
var broadcast 		= require('../../../config').tables.broadcast;


var model 			= module.exports;
model.setup		 	= setup;
model.loginUser	 	= onlogin.loginUser;
model.logoutUser	= onlogout.logoutUser;

function setup() {
	clearBroadcasts("true");							// delete everything
	var secondsInDay = 60 * 60 * 24;

	var filter = garbageSelector(secondsInDay);
	setInterval(clearBroadcasts.bind(filter), 2 * secondsInDay);
}

function clearBroadcasts(filter){
	w.Connect( new w.DeleteByFilter(broadcast, filter));
}
