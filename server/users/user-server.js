var http        = require('http');
var throng      = require('throng');
var cpus        = require('os').cpus().length;
var logger      = require('logfmt');
var jackrabbit  = require('jackrabbit');

var api         = require('./api/server-api');
var service     = require('./services/users-service');

http.globalAgent.maxSockets = Infinity;

var RABBIT_URL    = process.env.CLOUDAMQP_URL || 'amqp://ltucfmay:b5Xali0L8dttXKnJlsOyO3MyiuRm0AlN@owl.rmq.cloudamqp.com/ltucfmay';
var PORT          = process.env.PORT || 3000;
var SERVICE_TIME  = process.env.SERVICE_TIME || 500;

throng(start, { workers: cpus, lifetime: Infinity });

function start() {
  logger.log({ type: 'info', message: 'starting server' });

  // I init message-queue in this process so i can destroy user service  if
  // i lost the connection to rabbitmq on a error occur,
  var server, rabbit = jackrabbit(RABBIT_URL);
  var exchange  = rabbit.default();
  // var rpc       = exchange.queue({ name: 'rpc_queue', prefetch: 1, durable: false });

  rabbit.once('connected', listen);
  rabbit.once('disconnected', exit.bind(this, 'disconnected'));

  process.on('SIGTERM', exit);
  var _self = this;

  function listen() {
    var serverApi = api(exchange, SERVICE_TIME);

    service.start();

    server = http.createServer(serverApi);
    server.listen(PORT);

  }

  function exit(reason) {
    logger.log({ type: 'info', message: 'closing server', reason: reason });

    if (server) server.close(process.exit.bind(process));
    else process.exit();
  }
}
