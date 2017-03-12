var wiki = require('../models/wikipost');
var db = require('../models/wikipostDB');
var filters = require('../models/filterparser.js');
var path = require('path');

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

	app.get('/profile', isLoggedIn, function (req, res) {
		res.sendFile( path.resolve('views/profile.html') );
	});

	app.get('/profile/id', isLoggedIn, function (req, res) {
		res.send(JSON.stringify({id: req.user.id}));
	});

    app.post('/profile/addwikipost', isLoggedIn, function (req, res) {

        var wikipost = new wiki.WikiPost();
        wikipost.setProp("title", req.body.userData[0].title);

        console.log( wikipost.getProp("title") );

        var data = wikipost.getData();

        db.savePost(data, function (success, result) {
            if (success) res.json({
                status: 'OK'
            });
            else res.json({
                status: 'Error'
            });
        });
    });

    app.get('/profile/getwikiposts', isLoggedIn, function (req, res) {
        db.getPosts(function (result) {
            res.send(JSON.stringify(result));
        });
    });

    app.get('/profile/fieldsInfo', isLoggedIn, function (req, res) {
        db.getPosts(function (result) {
            res.send( JSON.stringify(wiki.FieldsInfo) );
        });
    });

	app.get('/profile/templates', isLoggedIn, function (req, res) {
        res.sendFile( path.resolve('views/templates.html') );
    });

	app.post('/profile/addfilter', isLoggedIn, function (req, res) {
        console.log(filters.createFilter(req.body.userData));
		console.log(req.user.id);
		db.addFilter(req.user.id, filters.createFilter(req.body.userData));
    });

	app.delete('/profile/wikipost/delete/:id', isLoggedIn, function(req,res){

		var id = req.params.id;

		db.deletePost(id, function (success, result) {
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
