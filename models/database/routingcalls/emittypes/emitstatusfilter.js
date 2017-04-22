var em 			= require("./emitgeneric.js");
var profile 	= require("../profile.js");
var filters 	= require("../../../filterparser/index.js");

var model 		= module.exports;
model.create	= create;

function create(io, row){
    'use strict';
	return new EmitStatusFilter(io, row);
}

EmitStatusFilter.prototype = Object.create(em.EmitGeneric.prototype);
EmitStatusFilter.prototype.constructor = EmitStatusFilter;

function EmitStatusFilter(io, row){
	em.EmitGeneric.call(this, io, row);
	this.emitType = 'statusFilter_';
	this.emitData = { id: row.id, status: row.status};

	if( row.status === filters.filterStatus.PLAY ){
		profile.listenFilter(row);
	}
}
