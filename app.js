var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var path = require('path');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var logger = require('express-logger');
var passport = require('passport');
var config = require('./config');
var model = require('./models/wikipostDB');
var calls = require('./models/callbacks');

require('./controllers/passport')(passport);


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(express.static(path.join(__dirname, 'views')));
app.use(express.static(path.join(__dirname, 'public')));

app.use(logger({
    path: 'logs.txt'
}));

app.use(session({
    secret: 'ilovescotchscotchyscotchscotch',
    resave: true,
    saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());
app.use(cookieParser());

var routes = require('./controllers/index')(app, passport);


server.listen(config.port, function() {
    console.log('Server up and listening on port %d', config.port);
    model.setup(function(error, data) {
        console.log("Gotcha!");
        if ((data.new_val !== null) && (data.old_val !== null)) {
            // update
            io.emit('update', data.new_val);
        } else if ((data.new_val !== null) && (data.old_val === null)) {
            // new wikipost
            io.emit('new', data.new_val);
        } else if ((data.new_val === null) && (data.old_val !== null)) {
            // deleted wikipost
            io.emit('delete', data.old_val);
        }
    });
});
