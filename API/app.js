var express = require('express');
var logger = require('morgan');
var bodyParser = require('body-parser');
var mongoose=require('mongoose');
var routes = require('./routes/index');
var path = require('path');
var app = express();

mongoose.connect('mongodb://localhost',function(err){
  if (err) throw err

  app.use(logger('dev'));
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use('/API/', routes);
  app.set('views', path.join(__dirname, 'views'));
  app.set('view engine', 'jade');

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
});


module.exports = app;
