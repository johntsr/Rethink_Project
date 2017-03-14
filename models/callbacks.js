var model = module.exports;

model.throwErrorCond =
	function(err) {
		if (err){
			throw err;
		}
	};

model.throwError =
	function(err) {
		throw err;
	};

model.noFun =
	function(err) {};


model.printOK =
	function(err) { console.log("OK");};

model.print =
	function(str) { console.log(str);};
