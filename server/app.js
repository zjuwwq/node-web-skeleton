var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var director = require("director");
var bookController = require('./controller/book.js');
var bookApiController = require('./controller/api/book.js');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'view'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /client
//app.use(favicon(__dirname + '/client/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '../client')));

// 使用director路由
var router = new director.http.Router();
app.use(function(req, res, next) {
    router.dispatch(req, res, function(err) {
        if (err) {
            res.writeHead(404);
            res.end();
        }
    });
});
router.get('/', function() {
    this.res.render('index');
});

router.get('/books', function(){
    bookController.list(this.req, this.res);
});

router.get('/books/:id', function(){
    this.req.query.id = /\/books\/([^\/]+)/.exec(this.req.url)[1];
    bookController.get(this.req, this.res);
});

router.get('/api/books', function() {
    var req = this.req;
    var res = this.res;
    var id = req.query.id;

    if (id) {
        bookApiController.get(req, res);
    } else {
        bookApiController.getList(req, res);
    }
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

app.set('port', process.env.PORT || 3000);

var server = app.listen(app.get('port'), function() {
    console.log('Express server listening on port ' + server.address().port);
});

module.exports = app;