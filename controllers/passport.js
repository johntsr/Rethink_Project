// config/passport.js

// load all the things we need
var LocalStrategy   = require('passport-local').Strategy;


// var User       		= require('../models/user');


// load up the user model
var user = {
    username: 'test-user',
    password: 'test-password',
    id: 1
};

function findUser (username, callback) {
  if (username === user.username) {
    return callback(null, user);
  }
  return callback(null);
}


// expose this function to our app using module.exports
module.exports = function(passport) {

	// =========================================================================
    // passport session setup ==================================================
    // =========================================================================
    // required for persistent login sessions
    // passport needs ability to serialize and unserialize users out of session

    // used to serialize the user for the session
    passport.serializeUser(function(user, done) {
        // done(null, user.id);
        done(null, user.username);
    });

    // used to deserialize the user
    passport.deserializeUser(function(username, done) {
        // User.findById(id, function(err, user) {
        //     done(err, user);
        // });
        findUser(username, done);
    });


    // =========================================================================
    // LOCAL LOGIN =============================================================
    // =========================================================================
    // we are using named strategies since we have one for login and one for signup
    // by default, if there was no name, it would just be called 'local'

    passport.use('local-login', new LocalStrategy(
    function(username, password, done) { // callback with email and password from our form

            findUser(username, function (err, user) {
              if (err) {
                return done(err);
              }
              if (!user) {
                return done(null, false);
              }
              if (password !== user.password  ) {
                return done(null, false);
              }
              return done(null, user);
        });

    }));

};
