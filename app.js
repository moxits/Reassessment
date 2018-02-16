var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var path = require('path');
var fs = require('fs');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var sessions = require('client-sessions');
var client = require('./postgres.js');
var index = require('./routes/index');
var users = require('./routes/users');
var reviews = require('./routes/reviews')


var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(sessions({
  cookieName: 'session',
	secret: 'eg[isfd-8yF9-7w2315df{}+Ijsli;;to8',
	duration: 30 * 60 * 1000,
	activeDuration: 5 * 60 * 1000,
	httpOnly: true,   //prevents browser JS from accessing cookies
	secure: true,     //ensures cookies are only used over HTTPS
	ephemeral: true   //deletes the cookie when the browser is closed
}));
app.use(function(req,res,next){
  if (req.session && req.session.user){
    req.user = req.session.user;
    delete req.user.password;
    res.locals.user = req.session.user;
    next();
  }else{
    next();
  }
});

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser({uploadDir:'C:/Users/Administrator/Desktop/ReviewR/myapp/public/images'}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/users', users);
//app.use('/reviews',reviews);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
