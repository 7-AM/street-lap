var express     = require('express');
var logger      = require('morgan');
var bodyParser  = require('body-parser');

module.exports = function(exchange, serviceTime) {

  var app     = express();

  var routes  = require('./routers/user');

  var allowCrossDomain = function(req, res, next) {
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
      res.header('Access-Control-Allow-Headers', 'Content-Type, Accept, Authorization, Content-Length, X-Requested-With');

      // intercept OPTIONS method
      if ('OPTIONS' == req.method) {
        res.sendStatus(200);
      } else {
        next();
      }
  };

  app.use(bodyParser.json());
  app.use(logger('dev'));
  app.use(allowCrossDomain);
  app.use('/api', routes(exchange, serviceTime));

  // catch 404 and forward to error handler
  app.use(function(req, res, next) {
      var err = new Error('Not Found');
      err.status = 404;
      next(err);
  });

  return app;

};
