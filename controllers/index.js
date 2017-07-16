/*jshint esversion: 6 */

var sources = require('../models/datasources/index.js');
var auth 	= require('../models/database/routingcalls/auth.js');
var setup 	= require('../models/database/routingcalls/setup.js');
var db 		= require('../models/database/routingcalls/profile.js');
var filters = require('../models/filterparser/index.js');
var path 	= require('path');

module.exports = function (app, passport, io) {

		app.get('/', function (req, res) {
			res.redirect('/login');
		});

		app.get('/login', function (req, res) {
			res.render(path.resolve('public/views/login'), {
	        message: req.flash('message')
	    	} );
		});

		app.post('/login', passport.authenticate('local-login', {
			successRedirect : '/profile',	 // redirect to the secure profile section
			failureRedirect : '/login', 	// redirect back to the signup page if there is an error
      failureFlash: true
      })
		);

    app.post('/logout', function(req, res) {
      setup.logoutUser(req.user.id);
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
			req.logout();
			auth.signOut(req.user.id);
			res.redirect('/login');
		});


		// NOTE: may not be accessed via web interface
		app.post('/sources', function(req, res) {
			sources.addTable(req.body.table, req.body.fieldsInfo);
			res.send( 'OK' );
		});

		app.post('/sources/:sourceName', function(req, res) {
			console.log('source = ' + req.params.sourceName);
			console.log('data = ' + req.body);
			console.log(req.body);
			console.log('');
			sources.addData(req.params.sourceName, req.body);
			res.send( 'OK' );
		});


		app.get('/profile', isLoggedIn, function (req, res) {
			setup.loginUser(io, req.user.id);
			res.sendFile( path.resolve( path.resolve('public/views/profile.html')) );
		});

    app.get('/profile/getposts', isLoggedIn, function (req, res) {
        db.getPosts(req.user.id, function (result) {
            res.send(JSON.stringify(result));
        });
    });

    app.get('/profile/fieldsInfo', isLoggedIn, function (req, res) {
				var tableInfo = {};
				for (var tableName of sources.tables()) {
					tableInfo[tableName] = sources.fieldsInfo(tableName);
				}

        var response = { "tableInfo": tableInfo, id: req.user.id};
        res.send( JSON.stringify(response) );
    });

    app.post('/profile/getfilters', isLoggedIn, function (req, res) {
        var table = req.body.table;
        db.getFilters(req.user.id, table, function (results) {
            var filterData = [];
            for (var i = 0; i < results.length; i++) {
                filterData.push({title: results[i].filterTitle, id: results[i].id, status: results[i].status, table: table});
            }
            res.send( JSON.stringify(filterData) );
        });
    });

		app.get('/profile/templates', isLoggedIn, function (req, res) {
	        res.sendFile( path.resolve(path.resolve('public/views/templates.html') ) );
	    });

		app.post('/profile/addfilter', isLoggedIn, function (req, res) {
			db.addFilter(filters.createFilterInfo(req.user.id, req.body.userData),
	        function(_success){
	            res.send( JSON.stringify({success: _success}) );
	        });
	    });

    app.delete('/profile/filters/delete', isLoggedIn, function(req,res){
        var filterID = req.body.id;
				db.setFilterStatus(req.user.id, filterID, function (success, result) {
            if (success) res.json({
                status: 'OK'
            });
            else res.json({
                status: 'Error'
            });
        }, filters.filterStatus.DELETE);
			});

		app.post('/profile/filters/pause', isLoggedIn, function(req,res){
	        var filterID = req.body.id;
			db.setFilterStatus(req.user.id, filterID, function (success, result) {
	            if (success) res.json({
	                status: 'OK'
	            });
	            else res.json({
	                status: 'Error'
	            });
	        }, filters.filterStatus.PAUSE);
				});

		app.post('/profile/filters/play', isLoggedIn, function(req,res){
        var filterID = req.body.id;
				db.setFilterStatus(req.user.id, filterID, function (success, result) {
            if (success) res.json({
                status: 'OK'
            });
            else res.json({
                status: 'Error'
            });
        }, filters.filterStatus.PLAY);
			});
};

function isLoggedIn(req, res, next) {

	// if user is authenticated in the session, carry on
	if (req.isAuthenticated())
		return next();

	// if they aren't redirect them to the home page
	res.redirect('/');
}
