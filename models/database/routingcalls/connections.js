var w 				= require("../operations/index.js");

var Connections = {};

var model 			= module.exports;
model.Connections	= Connections;
model.add			= add;
model.get			= get;
model.close			= close;

function add(id, conn){
	if( !get[id] ){
		Connections[id] = conn;
	}
}

function get(id){
	return Connections[id];
}

function close(id){
	if( get[id] ){
		w.close(Connections[id]);
	}
}
