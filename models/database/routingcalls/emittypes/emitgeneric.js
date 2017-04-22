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
};
