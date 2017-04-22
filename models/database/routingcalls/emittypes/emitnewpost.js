var em 		= require("./emitgeneric.js");

var model 		= module.exports;
model.create	= create;

function create(io, filterData, postData){
    'use strict';
	return new EmitNewPost(io, filterData, postData);
}

EmitNewPost.prototype = Object.create(em.EmitGeneric.prototype);
EmitNewPost.prototype.constructor = EmitNewPost;

function EmitNewPost(io, filterData, postData){
	em.EmitGeneric.call(this, io, filterData);
	this.emitType = 'new' + filterData.table + '_';
	this.emitData = {filterTitle: filterData.title, data: postData};
}
