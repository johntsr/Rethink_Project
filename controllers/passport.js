// load all the things we need
var LocalStrategy   = require('passport-local').Strategy;

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
        done(null, user.username);
    });

    // used to deserialize the user
    passport.deserializeUser(function(username, done) {
        findUser(username, done);
    });


    // =========================================================================
    // LOCAL LOGIN =============================================================
    // =========================================================================
    // we are using named strategies since we have one for login and one for signup
    // by default, if there was no name, it would just be called 'local'

    passport.use('local-login', new LocalStrategy({
	    passReqToCallback: true
	},
    // function(username, password, done) { // callback with email and password from our form
    function(req, username, password, done) { // callback with email and password from our form
        findUser(username, function (err, user) {
			console.log("Got in!");
			if (err) {
				// req.flash('message', 'Internal error');
				console.log("err!");
				return done(err);

			}
			if (!user) {
				// req.flash('message', 'Wrong username');
				// return done(null, false);
				console.log("name");
				return done(null, false, req.flash('message', "Wrong username"));
				// return done(null, false, {message: 'Wrong username'});
			}
			if (password !== user.password) {
				// req.flash('message', 'Wrong password');
				// return done(null, false);
				console.log("password");
				// return done(null, false, {message: 'Wrong password'});
				return done(null, false, req.flash('message', 'Wrong password'));
			}
			// req.flash('message', null);
				console.log("OK");
			return done(null, user);
    	});
    }));

};
