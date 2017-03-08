var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var path = require('path');
var bodyParser = require('body-parser');
var config = require('./config');
var model = require('./models/wikipostDB');


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'views')));
app.use(express.static(path.join(__dirname, 'public')));

var routes = require('./controllers/index')(app, server);


server.listen(config.port, function() {
    console.log('Server up and listening on port %d', config.port);
    model.setup(function(data) {
		if((data.new_val !== null) && (data.old_val !== null)) {
			// update
			// TODO
		} else if((data.new_val !== null) && (data.old_val === null)) {
			// new wikipost
			io.emit('addwikipost', data.new_val);
		}
		else if((data.new_val === null) && (data.old_val !== null)) {
			// deleted wikipost
			io.emit('delete', data.old_val);
		}
    });
});
