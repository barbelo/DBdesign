var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');


//routes
let indexRouter = require('./routes/index');   //入口

let psg_login = require('./routes/passenger-login-register');  //乘客登录
let cmpy_login = require('./routes/company_login');
let search = require('./routes/search');    //查询机票 购票
// var cmy_insert = require('./routes/insert-new-airline');  //航空公司增加航班
let order = require('./routes/order');          //查看订单，退票

var app = express();

// view engine setup
/*app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');*/
//记得问
app.engine('.html', require("ejs").__express);
app.set("view engine", "html");
app.set('views', path.join(__dirname, 'views'));
// app.engine('.ejs', require('ejs').__express);
// app.set('views engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//路由分配
app.use('/', indexRouter);
app.use('/passenger-login-register', psg_login);
app.use('/company-login', cmpy_login);
app.use('/search', search);
// app.use('/insert-new-airline', cmy_insert);
app.use('/order', order);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
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
