var model 		= module.exports;
model.create 	= create;

function create(_table, _filterInfoData, _wikiPostChange){
	return new Broadcast(_table, _filterInfoData, _wikiPostChange);
}

function Broadcast(_table, _filterInfoData, _wikiPostChange){
'use strict';

	this.data = {};
	this.data.filterInfoData = _filterInfoData;
	this.data.table = _table;
	this.data.emit = '';
	this.data.broadcastData = {};
	this.data.id = [];

	if ((_wikiPostChange.new_val !== null) && (_wikiPostChange.old_val !== null)) {           // update post
		this.data.emit = 'update' + this.data.table + '_';
		this.data.broadcastData = _wikiPostChange.new_val;
	} else if ((_wikiPostChange.new_val !== null) && (_wikiPostChange.old_val === null)) {    // new post
		this.data.emit = 'new' + this.data.table + '_';
		this.data.broadcastData = _wikiPostChange.new_val;
	} else if ((_wikiPostChange.new_val === null) && (_wikiPostChange.old_val !== null)) {    // deleted post
		this.data.emit = 'delete' + this.data.table + '_';
		this.data.broadcastData = _wikiPostChange.old_val;
	}
	this.data.id = [_filterInfoData.userID, this.data.broadcastData.id];
}

Broadcast.prototype.getData = function(){
	return this.data;
};
