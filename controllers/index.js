var wiki 	= require('../models/datasources/wikipost.js');
var auth 	= require('../models/database/routingcalls/auth.js');
var db 		= require('../models/database/routingcalls/profile.js');
var filters = require('../models/filterparser/index.js');
var path 	= require('path');

module.exports = function (app, passport) {

	app.get('/', function (req, res) {
		res.redirect('/login');
	});

	app.get('/login', function (req, res) {
		res.render(path.resolve('views/login'), {
        message: req.flash('message')
    	} );
	});

	app.post('/login', passport.authenticate('local-login', {
		successRedirect : '/profile',	// redirect to the secure profile section
		failureRedirect : '/login', 	// redirect back to the signup page if there is an error
        failureFlash: true
        }));

    app.post('/logout', function(req, res) {
		req.logout();
		res.redirect('/login');
	});

    app.post('/signin', function(req, res) {
        var username = req.body.username;
        var password = req.body.password;
		auth.signIn(username, password,
            function(_success){
                res.send( JSON.stringify({success: _success}) );
            }
        );
	});

	app.post('/signout', function(req, res) {
        var userID = req.user.id;
		req.logout();
		auth.signOut(userID);
		res.redirect('/login');
	});



	app.get('/profile', isLoggedIn, function (req, res) {
		res.sendFile( path.resolve('views/profile.html') );
	});

	app.get('/profile/id', isLoggedIn, function (req, res) {
		res.send(JSON.stringify({id: req.user.id}));
	});

    app.get('/profile/getwikiposts', isLoggedIn, function (req, res) {
        db.getPosts(function (result) {
            res.send(JSON.stringify(result));
        });
    });

    app.get('/profile/fieldsInfo', isLoggedIn, function (req, res) {
        res.send( JSON.stringify(wiki.FieldsInfo) );
    });

    app.post('/profile/getfilters', isLoggedIn, function (req, res) {
        var table = req.body.table;
        db.getFilters(req.user.id, table, function (results) {
            var filterData = [];
            for (var i = 0; i < results.length; i++) {
                filterData.push({title: results[i].filterTitle, id: results[i].id});
            }
            res.send( JSON.stringify(filterData) );
        });
    });

	app.get('/profile/templates', isLoggedIn, function (req, res) {
        res.sendFile( path.resolve('views/templates.html') );
    });

	app.post('/profile/addfilter', isLoggedIn, function (req, res) {
		db.addFilter(filters.createFilterInfo(req.user.id, req.body.userData),
        function(_success){
            res.send( JSON.stringify({success: _success}) );
        });
    });

    app.delete('/profile/filters/delete', isLoggedIn, function(req,res){
        var filterID = req.body.id;
		db.deleteFilter(filterID, function (success, result) {
            if (success) res.json({
                status: 'OK'
            });
            else res.json({
                status: 'Error'
            });
        });
	});
};

function isLoggedIn(req, res, next) {

	// if user is authenticated in the session, carry on
	if (req.isAuthenticated())
		return next();

	// if they aren't redirect them to the home page
	res.redirect('/');
}
