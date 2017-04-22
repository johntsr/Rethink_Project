var em 		= require("./emitgeneric.js");

var model 		= module.exports;
model.create	= create;

function create(io, filterData, postData){
    'use strict';
	return new EmitDeletePost(io, filterData, postData);
}

EmitDeletePost.prototype = Object.create(em.EmitGeneric.prototype);
EmitDeletePost.prototype.constructor = EmitDeletePost;

function EmitDeletePost(io, filterData, postData){
	em.EmitGeneric.call(this, io, filterData);
	this.emitType = 'delete' + filterData.table + '_';
	this.emitData = {filterTitle: filterData.title, data: postData};
}
