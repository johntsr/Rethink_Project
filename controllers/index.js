var wiki = require('../models/wikipost');
var db = require('../models/wikipostDB');
var path = require('path');

module.exports = function (app) {
    app.get('/', function (req, res) {
        res.sendFile( path.resolve('views/index.html') );
    });

    app.post('/addwikipost', function (req, res) {

        var wikipost = new wiki.WikiPost();
        wikipost.setProp("title", req.body.title);

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

    app.get('/getwikiposts', function (req, res) {
        db.getPosts(function (result) {
            res.send(JSON.stringify(result));
        });
    });

    app.get('/fieldsInfo', function (req, res) {
        db.getPosts(function (result) {
            res.send( JSON.stringify(wiki.FieldsInfo) );
        });
    });

	app.get('/templates', function (req, res) {
        res.sendFile( path.resolve('views/templates.html') );
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
