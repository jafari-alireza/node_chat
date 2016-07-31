var express = require('express');
var layout = require('express-ejs-layouts');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var passport = require('passport');
var session = require('express-session');
var morgan = require('morgan');

var app = express();

var server_port = process.env.OPENSHIFT_NODEJS_PORT || 8080
var server_ip_address = process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1'
 


var messageRouter = require('./src/routes/messageRoutes');
var signupRouter = require('./src/routes/signupRoutes');
var authRouter = require('./src/routes/authRoutes');
var loginRouter = require('./src/routes/loginRoutes');
var homeRouter = require('./src/routes/homeRoutes');

var mysqlCon = require('./src/db/mysql');

app.use(express.static('assets'));
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

app.listen(server_port, server_ip_address, function () {
  console.log( "Listening on " + server_ip_address + ", server_port " + server_port )
});

