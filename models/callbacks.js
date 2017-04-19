// Commonly used functions-callbacks
// Abbreviate them here to avoid duplication of code

var model = module.exports;

model.throwErrorCond 	= throwErrorCond;
model.throwError 		= throwError;
model.noFun 			= noFun;
model.printOK 			= printOK;
model.print 			= print;

function throwErrorCond(err) {
	'use strict';
	if (err) {
		throw err;
	}
}

function throwError(err) {
	'use strict';
	throw err;
}

function noFun(err) {
	'use strict';
}

function printOK(err) {
	'use strict';
	console.log("OK");
}

function print(str) {
	'use strict';
	console.log(str);
}
