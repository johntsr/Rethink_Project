var model 				= module.exports;
model.create 			= create;

function create(fInfoData, rowChange){
	var row = ( rowChange.new_val !== null )? rowChange.new_val : rowChange.old_val;

	return {
		id: uniqueID(fInfoData.userID, row.id),
		postTable	: fInfoData.table,
		postID		: row.id,
		filterID	: fInfoData.id,
		timestamp	: Math.floor(new Date() / 1000)	// current time in seconds
	};
}


function uniqueID(userID, postID){
	return [userID, postID];
}
