var w 						= require("../operations/index.js");
var config 					= require('../../../config');
var fparser 				= require('../../filterparser/index.js');
var connections 			= require("./connections.js");

var model 					= module.exports;
model.getUserByID 			= getUserByID;
model.getUserByCredentials 	= getUserByCredentials;
model.signIn 				= signIn;
model.signOut 				= signOut;

function setConnDB(connInfo, _db){
    result = w.copy(connInfo);
    result.db = _db;
    return result;
}

function getUserByID(userID, callback) {
    w.Connect( new w.GetByKey(config.tables.users, userID,
        function (user){ callback(null, user); },
        function (error){ callback(error); })
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
    _username = fparser.htmlSpecialChars(_username);
    _password = fparser.htmlSpecialChars(_password);
    model.getUserByCredentials(_username, _password,
        function (error, user){
            if(!error && !user){
                w.Connect(
                  new w.Insert(config.tables.users, {username: _username, password: _password}, {returnChanges: true}, createEmitUser)
                );
                callback(true);
            }
            else{
                callback(false);
            }
        }
    );
}

function signOut(userID){
    w.Connect( new w.GetByKey(config.tables.users, userID, function (data){

      username = data.id;

      w.Connect( new w.DeleteByKey(config.tables.users, userID), connections.get(userID) );
      var filter = fparser.AndExpressions([{name: 'userID', value: userID}]).toNoSQLQuery();
      w.Connect( new w.DeleteByFilter(config.tables.filters, filter), connections.get(userID) );

      systemDB = setConnDB(config.emitDatabase, 'rethinkdb');
      w.ConnectToDB( systemDB, new w.DeleteByKey('users', username));
      w.ConnectToDB( config.emitDatabase, new w.DropTable(username));
    }), connections.get(userID) );

}

function createEmitUser(insertResult) {
  _userID = insertResult.generated_keys[0];
  username = insertResult.changes[0].new_val.username;
  pass = insertResult.changes[0].new_val.password;

  systemDB = setConnDB(config.emitDatabase, 'rethinkdb');
  userTable = w.toTableName(_userID);
  w.ConnectToDB( systemDB,
    new w.Insert('users', { id: username, password: pass }, {}, function (){
      w.ConnectToDB( config.emitDatabase,
        new w.CreateTable(userTable, {}, function (){
          w.ConnectToDB( config.emitDatabase,
            new w.Grant(userTable, username, {read: true})
          );
        })
      );
    })
  );
}
