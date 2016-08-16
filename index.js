var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
var layout = require('express-ejs-layouts');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var passport = require('passport');
var session = require('express-session');
var morgan = require('morgan');

var server_port = process.env.OPENSHIFT_NODEJS_PORT || 8080
var server_ip_address = process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1'
 


var messageRouter = require('./src/routes/messageRoutes');
var signupRouter = require('./src/routes/signupRoutes');
var authRouter = require('./src/routes/authRoutes');
var loginRouter = require('./src/routes/loginRoutes');
var homeRouter = require('./src/routes/homeRoutes');

var mysqlCon = require('./src/db/mysql');

app.use(express.static('assets'));
app.use('/scripts', express.static(__dirname + '/node_modules/bootstrap/dist/'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(session({secret: 'Gm]7vhwDn/=v-$Zw'}));
app.use(layout);
app.use(morgan('dev'));

require('./src/config/passport')(app);

app.set('views', './src/views');
// app.set('views', __dirname + '/src/views');

app.set('view engine', 'ejs');

app.set("layout extractScripts", true)


app.use('/home', homeRouter);
app.use('/message', messageRouter);
app.use('/signup', signupRouter);
app.use('/auth', authRouter);
app.use('/login', loginRouter);

// app.listen(port, function(err) {
// 	console.log("listening on port " + port + " hello world :D ");
// });

io.on('connection', function(socket) {
  	console.log('a user connected');
	socket.on('disconnect', function() {
		console.log('user disconnected');
	});

  	socket.on('channel:message:send', function(message) {
  		// console.log(data.id);
	    channels = 'channel:message:send' + ':' + message.data.id;
	    socket.broadcast.emit(channels, {message: message.data.message, 
	    	username: message.data.username, time: message.data.time, unread_message: message.data.unread_message});
  	});

  	socket.on('channel:message:send:update', function(message) {
  		// console.log(message.data.id);
	    channels = 'channel:message:send:update' + ':' + message.data.contact_id;
	    console.log(message.data.contact_id);
	    socket.broadcast.emit(channels, {message: message.data.message, 
	    	username: message.data.username, time: message.data.time, 
	    	unread_message: message.data.unread_message,unread_message_detailed: message.data.unread_message_detailed, id: message.data.id});
  	});


 });

server.listen(server_port, server_ip_address, function () {
  console.log( "Listening on " + server_ip_address + ", server_port " + server_port )
});

