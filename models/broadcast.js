var model 		= module.exports;
model.create 	= create;

function create(_filterInfoData, postChange){
	return new Broadcast(_filterInfoData, postChange);
}

function Broadcast(_filterInfoData, postChange){
	'use strict';

	this.data = {};
	this.data.filterInfoData = _filterInfoData;
	this.data.table = _filterInfoData.table;
	this.data.emit = '';
	this.data.broadcastData = {};
	this.data.id = [];

	if ((postChange.new_val !== null) && (postChange.old_val !== null)) {           // update post
		this.data.emit = 'update' + this.data.table + '_';
		this.data.broadcastData = postChange.new_val;
	} else if ((postChange.new_val !== null) && (postChange.old_val === null)) {    // new post
		this.data.emit = 'new' + this.data.table + '_';
		this.data.broadcastData = postChange.new_val;
	} else if ((postChange.new_val === null) && (postChange.old_val !== null)) {    // deleted post
		this.data.emit = 'delete' + this.data.table + '_';
		this.data.broadcastData = postChange.old_val;
	}
	this.data.id = [this.data.filterInfoData.userID, this.data.broadcastData.id];
}

Broadcast.prototype.getData = function(){
	return this.data;
};
