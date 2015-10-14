var http        = require('http');
var throng      = require('throng');
var dotenv      = require('dotenv');
var cpus        = require('os').cpus().length;
var logger      = require('logfmt');
var jackrabbit  = require('jackrabbit');

var api         = require('./api/server-api');
var service     = require('./services/users-service');

dotenv.load();

http.globalAgent.maxSockets = Infinity;

var RABBIT_URL    = process.env.CLOUDAMQP_URL       || 'amqp://localhost';
var PORT          = process.env.SERVICE_USER_PORT   || 3000;
var SERVICE_TIME  = process.env.SERVICE_TIME        || 500;
var MONGO_URL     = process.env.MONGO_URL           || '';

throng(start, { workers: cpus, lifetime: Infinity });

function start() {
  logger.log({ type: 'info', message: 'starting server' });

  // I init message-queue in this process so i can destroy user service  if
  // i lost the connection to rabbitmq on a error occur,
  var server;
  var rabbit    = jackrabbit(RABBIT_URL);
  var exchange  = rabbit.default();

  rabbit.once('connected', listen);
  rabbit.once('disconnected', exit.bind(this, 'disconnected'));

  process.on('SIGTERM', exit);

  function listen() {

    var serverApi = api(exchange, SERVICE_TIME);

    service.start(RABBIT_URL, MONGO_URL);

    server = http.createServer(serverApi);

    server.listen(PORT);

  }

  function exit(reason) {
    logger.log({ type: 'info', message: 'closing server', reason: reason });

    if (server) server.close(process.exit.bind(process));
    else process.exit();
  }
}
