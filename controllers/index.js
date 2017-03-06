var wiki = require('../models/wikipost');
var db = require('../models/wikipostDB');
var path = require('path');
fs = require('fs');

module.exports = function (app) {
    app.get('/', function (req, res) {
        db.getPosts(function (result) {
            res.render('index', {
                wikiposts: result
            });
        });
    });

    app.post('/wikipost', function (req, res) {

        var wikipost = new wiki.WikiPost().getData();
        wikipost.setProp("title", req.body.title);

        var data = wikipost.getdata();

        db.savePost(data, function (success, result) {
            if (success) res.json({
                status: 'OK'
            });
            else res.json({
                status: 'Error'
            });
        });
    });

    app.get('/fieldsInfo', function (req, res) {
        db.getPosts(function (result) {
            res.send( JSON.stringify(wiki.FieldsInfo) );
        });
    });

	app.get('/templates', function (req, res) {
        res.sendFile( path.resolve('public/templates.html') );
        // fs.readFile('public/templates.html', 'utf8', function (err,data) {
        //     if (err) {
        //         res.send( err );
        //     }
        //     else{
        //         res.send( data );
        //     }
        // });
    });

	app.delete('/wikipost/delete/:id',function(req,res){

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
