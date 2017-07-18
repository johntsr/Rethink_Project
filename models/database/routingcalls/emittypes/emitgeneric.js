var w 					= require("../../operations/index.js");
var auth          = require('../../routingcalls/auth.js');
var config 			= require('../../../../config');

var model 			= module.exports;
model.EmitGeneric 	= EmitGeneric;

function EmitGeneric(io, row){
	this.emitType = '';
	this.emitData = {};
	this.userID = row.userID;
	this.io = io;
}

EmitGeneric.prototype.emit = function () {
	this.io.emit(this.emitType + this.userID, this.emitData);
	emit(this.emitType, this.userID, this.emitData);
};

function emit(emitType, userID, emitData){
	w.ConnectToDB( config.emitDatabase,
		new w.Insert(w.toTableName(userID), { type: emitType, data: emitData })
	);
}
