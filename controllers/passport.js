// load all the things we need
var LocalStrategy   = require('passport-local').Strategy;
var db = require('../models/database/routingcalls/auth.js');

// expose this function to our app using module.exports
module.exports = function(passport) {

	// =========================================================================
    // passport session setup ==================================================
    // =========================================================================
    // required for persistent login sessions
    // passport needs ability to serialize and unserialize users out of session

    // used to serialize the user for the session
    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    // used to deserialize the user
    passport.deserializeUser(function(userID, done) {
		db.getUserByID(userID, done);
    });


    // =========================================================================
    // LOCAL LOGIN =============================================================
    // =========================================================================
    // we are using named strategies since we have one for login and one for signup
    // by default, if there was no name, it would just be called 'local'

    passport.use('local-login', new LocalStrategy({
	    passReqToCallback: true
	},
    function(req, username, password, done) {
        db.getUserByCredentials(username, password, function (err, user) {
			if (err) {
				return done(err);
			}

			if (!user) {
				return done(null, false, req.flash('message', "Wrong credentials"));
			}

			return done(null, user);
    	});
    }));

};
