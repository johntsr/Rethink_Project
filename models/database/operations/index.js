var conn 				= require("./connection.js");
var insert 				= require("./insert.js");
var deletebykey 		= require("./deletebykey.js");
var deletebyfilter 		= require("./deletebyfilter.js");
var getbykey 			= require("./getbykey.js");
var getbyfilter 		= require("./getbyfilter.js");
var updatebykey 		= require("./updatebykey.js");

var model 				= module.exports;
model.cursorToArray 	= conn.cursorToArray;
model.cursorToField 	= conn.cursorToField;
model.close 			= conn.close;
model.connect 			= conn.connect;
model.Connect 			= conn.Connect;

model.Insert 			= insert.create;
model.DeleteByKey 		= deletebykey.create;
model.DeleteByFilter	= deletebyfilter.create;
model.GetByKey 			= getbykey.create;
model.GetByFilter 		= getbyfilter.create;
model.UpdateByKey	 	= updatebykey.create;