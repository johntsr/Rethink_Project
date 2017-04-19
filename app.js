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
var model = require('./models/database/routingcalls/setup.js');
var calls = require('./models/callbacks');
var flash = require('connect-flash');

require('./controllers/passport')(passport);


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(express.static(path.join(__dirname, 'views')));
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
    secret: 'SpanoulisFTW',
    resave: true,
    saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());
app.use(cookieParser());

app.use(flash());
app.set('view engine', 'ejs');

var routes = require('./controllers/index')(app, passport);


server.listen(config.port, function() {
    console.log('Server up and listening on port %d', config.port);
    model.setup(io);
});
