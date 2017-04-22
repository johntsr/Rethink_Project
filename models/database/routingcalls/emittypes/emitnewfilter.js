var em 		= require("./emitgeneric.js");
var profile = require("../profile.js");

var model 		= module.exports;
model.create	= create;

function create(io, row){
    'use strict';
	return new EmitNewFilter(io, row);
}

EmitNewFilter.prototype = Object.create(em.EmitGeneric.prototype);
EmitNewFilter.prototype.constructor = EmitNewFilter;

function EmitNewFilter(io, row){
	em.EmitGeneric.call(this, io, row);
	this.emitType = 'newFilter_';
	profile.listenFilter(row);
	this.emitData = { id: row.id, title: row.filterTitle, table: row.table, status: row.status};
}
