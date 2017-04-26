var model 				= module.exports;
model.create 			= create;
model.dummy 			= dummy;
model.getTime 			= getTime;

function create(fInfoData, rowChange){
	var row = ( rowChange.new_val !== null )? rowChange.new_val : rowChange.old_val;

	return {
		id: uniqueID(fInfoData.userID, row.id),
		postTable	: fInfoData.table,
		postID		: row.id,
		filterID	: fInfoData.id,
		userID		: fInfoData.userID,
		timestamp	: getTime()
	};
}

function dummy(){
	return {
		postTable	: null,
		postID		: null,
		filterID	: null,
		userID		: null,
		timestamp	: getTime()
	};
}

function getTime(){
	return Math.floor(new Date() / 1000);	// current time in seconds;
}


function uniqueID(userID, postID){
	return [userID, postID];
}
