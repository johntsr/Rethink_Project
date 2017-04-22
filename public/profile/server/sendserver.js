function SendServerData(){
	this.data = {};
	this.errorInfo = { error: { triggered: false, description: ""} };
}

SendServerData.prototype.toString = function(){
	return JSON.stringify(this.data);
};

SendServerData.prototype.getData = function(){
	return this.data;
};

SendServerData.prototype.triggerError = function(description){
	this.errorInfo.triggered = true;
	this.errorInfo.description = description;
};

SendServerData.prototype.error = function(){
	return this.errorInfo.triggered;
};

SendServerData.prototype.add = function(newLabel, newData){
	if( !this.error() ){
		this.data[newLabel] = newData;
	}
};

SendServerData.prototype.push = function(label, newData){
	if( !this.error() ){
		if(!this.data[label]){
			this.data[label] = [];
		}
		this.data[label].push(newData);
	}
};

SendServerData.prototype.send = function(serverURL, callback){
	if(!callback){
		callback = function(data) {};
	}

	if( this.error() ){
		alert(this.errorInfo.description);
	}
	else{
		$.ajax({
			type: 'POST',
			url: serverURL,
			data: {
				userData: this.data
			},
			success: callback
		});
	}
};
