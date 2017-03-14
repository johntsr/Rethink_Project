/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/* jshint node: true */
'use strict';

var model = module.exports;

model.WikiBroadcast = function (_filterInfoData, _wikiPostChange){
	this.data = {};
	this.data.filterInfoData = _filterInfoData;
	this.data.emit = '';
	this.data.broadcastData = {};
	this.data.id = [];

	if ((_wikiPostChange.new_val !== null) && (_wikiPostChange.old_val !== null)) {           // update
		this.data.emit = 'updateWiki_';
		this.data.broadcastData = _wikiPostChange.new_val;
	} else if ((_wikiPostChange.new_val !== null) && (_wikiPostChange.old_val === null)) {    // new wikipost
		this.data.emit = 'newWiki_';
		this.data.broadcastData = _wikiPostChange.new_val;
	} else if ((_wikiPostChange.new_val === null) && (_wikiPostChange.old_val !== null)) {    // deleted wikipost
		this.data.emit = 'deleteWiki_';
		this.data.broadcastData = _wikiPostChange.old_val;
	}
	this.data.id = [_filterInfoData.userID, this.data.broadcastData.id];
};

model.WikiBroadcast.prototype.getData = function(){
	return this.data;
};
