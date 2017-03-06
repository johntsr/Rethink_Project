/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/* jshint node: true */
'use strict';


var model = module.exports;

function ParseString (someString){
	this.content = someString;
}

ParseString.prototype.parseBool = function(){
	return Boolean(this.content);
};
