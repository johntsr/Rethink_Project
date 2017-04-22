var deleteF 	= require("./emitdeletefilter.js");
var statusF 	= require("./emitstatusfilter.js");
var newF 		= require("./emitnewfilter.js");

var newP 		= require("./emitnewpost.js");

var model 		= module.exports;
model.createF 	= createF;
model.createP 	= createP;

function createF(io, rowChange){
	if( rowChange.new_val && !rowChange.old_val ){
		return newF.create(io, rowChange.new_val);
	}
	else if( !rowChange.new_val && rowChange.old_val ){
		return deleteF.create(io, rowChange.old_val);
	}
	else{
		return statusF.create(io, rowChange.new_val);
	}
}

function createP(io, filterData, postChange){
	if( postChange.new_val && !postChange.old_val ){
		return newP.create(io, filterData, postChange.new_val);
	}
	else{
		return deleteP.create(io, filterData, postChange.old_val);
	}
}
