var em 		= require("./emitgeneric.js");

var model 		= module.exports;
model.create	= create;

function create(io, row){
    'use strict';
	return new EmitDeleteFilter(io, row);
}

EmitDeleteFilter.prototype = Object.create(em.EmitGeneric.prototype);
EmitDeleteFilter.prototype.constructor = EmitDeleteFilter;

function EmitDeleteFilter(io, row){
	em.EmitGeneric.call(this, io, row);
	this.emitType = 'deleteFilter_';
	this.emitData = { id: row.id};
}
