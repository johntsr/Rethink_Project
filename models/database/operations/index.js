var conn 				= require("./connection.js");
var insert 				= require("./insert.js");
var deletebykey 		= require("./deletebykey.js");
var deletebyfilter 		= require("./deletebyfilter.js");
var getall 			= require("./getall.js");
var getbykey 			= require("./getbykey.js");
var getbyfilter 		= require("./getbyfilter.js");
var countbyfilter 		= require("./countbyfilter.js");
var updatebykey 		= require("./updatebykey.js");
var createdb 		= require("./createdb.js");
var createtable 		= require("./createtable.js");
var droptable 		= require("./droptable.js");
var grant 	= require("./grant.js");

function copy(obj){
  return JSON.parse(JSON.stringify(obj));
}

function toTableName(str) {
  return str.replace(/-/g, "_");
}

var model 				    = module.exports;
model.cursorToArray   = conn.cursorToArray;
model.cursorToField   = conn.cursorToField;
model.close 			    = conn.close;
model.connect 			  = conn.connect;
model.Connect 			  = conn.Connect;
model.ConnectToDB 	  = conn.ConnectToDB;
model.emit 			      = conn.emit;
model.copy 			      = copy;
model.toTableName 		= toTableName;

model.Insert 			    = insert.create;
model.DeleteByKey 		= deletebykey.create;
model.DeleteByFilter	= deletebyfilter.create;
model.GetByKey 			  = getbykey.create;
model.GetAll          = getall.create;
model.GetByFilter 		= getbyfilter.create;
model.CountByFilter	 	= countbyfilter.create;
model.UpdateByKey	 	  = updatebykey.create;
model.CreateDB	 	    = createdb.create;
model.CreateTable	 	  = createtable.create;
model.DropTable	 	  = droptable.create;
model.Grant	 	  = grant.create;
