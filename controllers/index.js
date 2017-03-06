var model = require('../models/wikipost');
var model = require('../models/wikipostDB');

module.exports = function (app) {
    app.get('/', function (req, res) {
        model.getPosts(function (result) {
            res.render('index', {
                wikiposts: result
            });
        });
    });

    app.post('/wikipost', function (req, res) {
        var wikipost = new wiki.WikiPost().getData();
        wikipost.setProp("title", req.body.title);

        var data = wikipost.getdata();

        model.savePost(data, function (success, result) {
            if (success) res.json({
                status: 'OK'
            });
            else res.json({
                status: 'Error'
            });
        });
    });

	app.delete('/wikipost/delete/:id',function(req,res){

		var wikipost = {
	        id:req.params.id
	    };

        console.log(wikipost.id);

		model.deletePost(wikipost.id, function (success, result) {
            if (success) res.json({
                status: 'OK'
            });
            else res.json({
                status: 'Error'
            });
        });
	});

};
