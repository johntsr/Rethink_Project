var w 				= require("../operations/index.js");

var Connections = {};

var model 			= module.exports;
model.add			= add;
model.get			= get;
model.close			= close;
model.alive			= alive;
model.die			= die;

function add(id, _conn){
	if( !get[id] ){
		Connections[id] = {conn: _conn, alive: true};
	}
}

function get(id){
	if( Connections[id] ){
		return Connections[id].conn;
	}
	else{
		return null;
	}
}

function alive(id){
	return Connections[id].alive;
}

function die(id){
	Connections[id].alive = false;
}

function close(id){
	w.close(Connections[id].conn);
	delete Connections[id];
}
