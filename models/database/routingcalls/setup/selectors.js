var AndExpressions 		= require("../../../filterparser/index.js").AndExpressions;
var getTime 			= require("../broadcastdata.js").getTime;

var model 				= module.exports;
model.userSelector		= userSelector;
model.spamSelector		= spamSelector;
model.garbageSelector	= garbageSelector;

function userSelector(userID){
	return AndExpressions([
		{
    		name: 'userID',
    		value: userID
    	}
    ]).toNoSQLQuery();
}

function spamSelector(filterData){
	var currentTime = getTime() - filterData.frequency.seconds;
	return AndExpressions([
		{
    		name: 'userID',
    		value: filterData.userID
    	},
		{
    		name: 'filterID',
    		value: filterData.id
    	},
		{
    		name: 'sent',
    		value: true
    	},
		{
    		name: 'timestamp',
				op:	'>',
    		value: currentTime
    	}
    ]).toNoSQLQuery();
}

function garbageSelector(seconds){
	var currentTime = getTime() - seconds;
	return AndExpressions([
		{
    		name: 'timestamp',
			op:	'<',
    		value: currentTime
    	}
    ]).toNoSQLQuery();
}
