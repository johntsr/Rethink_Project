var w 						= require("../operations/index.js");
var config 					= require('../../../config');
var fparser 				= require('../../filterparser/index.js');
var connections 			= require("./connections.js");

var model 					= module.exports;
model.getUserByID 			= getUserByID;
model.getUserByCredentials 	= getUserByCredentials;
model.signIn 				= signIn;
model.signOut 				= signOut;

function getUserByID(userID, callback) {
    w.Connect( new w.GetByKey(config.tables.users, userID,
        function (user){ callback(null, user); },
        function (error){ callback(error); }),
        connections.get(userID)
    );
}

function getUserByCredentials(username, password, callback) {
    var filter = fparser.AndExpressions([{name:'username', value:fparser.htmlSpecialChars(username)},
                                        {name:'password', value:fparser.htmlSpecialChars(password)}]).toNoSQLQuery();
    w.Connect(
        new w.GetByFilter(config.tables.users, filter,
            function (cursor){ w.cursorToField(cursor, callback); },
            function (error){ callback(error); })
    );
}

function signIn(_username, _password, callback){
    model.getUserByCredentials(_username, _password,
        function (error, user){
            if(!error && !user){
                w.Connect( new w.Insert(config.tables.users, {username: fparser.htmlSpecialChars(_username), password: fparser.htmlSpecialChars(_password)}) );
                callback(true);
            }
            else{
                callback(false);
            }
        }
    );
}

function signOut(userID){
    w.Connect( new w.DeleteByKey(config.tables.users, userID), connections.get(userID) );

    var filter = fparser.AndExpressions([{name: 'userID', value: userID}]).toNoSQLQuery();
    w.Connect( new w.DeleteByFilter(config.tables.filters, filter), connections.get(userID) );
}
