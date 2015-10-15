var mongoose    = require('mongoose');
var jackrabbit  = require('jackrabbit');
var logger      = require('logfmt');
var User        = require('../api/models/user').User;

module.exports.start = function(rabbit_url, mongo_url) {

  logger.log({ type: 'info', message: 'STARTING USERS SERVICE' });

  mongoose.connect(mongo_url);

  var rabbit      = jackrabbit(rabbit_url);
  var exchange    = rabbit.default();

  var userAdd     = exchange.queue({ name: 'api.post.user', prefetch: 1, durable: false });
  var userUpdate  = exchange.queue({ name: 'api.put.user', prefetch: 1, durable: false });
  var userDelete  = exchange.queue({ name: 'api.delete.user', prefetch: 1, durable: false });
  var userById    = exchange.queue({ name: 'api.get.user.id', prefetch: 1, durable: false });
  var userAll     = exchange.queue({ name: 'api.get.user', prefetch: 1, durable: false });

  rabbit.once('connected', listen);
  rabbit.once('disconnected', exit.bind(this, 'disconnected'));

  process.once('uncaughtException', exit);

  function listen() {
    logger.log({ type: 'info', message: 'Service connected to message queue' });

    userAdd.consume(add);
    userUpdate.consume(update);
    userById.consume(getSingleUser);
    userAll.consume(getAllUsers);
    userDelete.consume(deleteUser);
  }

  function add(data, reply) {
    logger.log({ type: 'info', message: 'service adding user' });

    var user = new User(data.user);

    user.save(function(err) {
      if(err) {
        logger.log({ type: 'error', message: err });
        return reply({error: err});
      }

      return reply({user: user});
    });
  }

  function update(data, reply) {
    logger.log({ type: 'info', message: 'service update user' });

    User.findByIdAndUpdate(data.id, {$set: data.update}, function(err, user) {
	    if(err) {
        logger.log({ type: 'error', message: err });
	      return reply({error: err});
	    }

	    return reply({user: user});
	  });
  }


  function getSingleUser(data, reply) {
    logger.log({ type: 'info', message: 'service getting single user' });

     User.findById(data.id, function(err, user) {

       if(err) {
         logger.log({ type: 'error', message: err });
         return reply({error: err});
       }

       return reply({user: user});
     });
  }

  function getAllUsers(query, reply) {
    logger.log({ type: 'info', message: 'service getting all users' });

    User.find(query, function(err, users) {

      if(err) {
        logger.log({ type: 'error', message: err });

        return reply({error: err});
      }

      return reply({users: users});

    });
  }

  function deleteUser(data, reply) {
    logger.log({ type: 'info', message: 'service delete user' });

    User.findByIdAndRemove(data.id, function(err) {
	    if(err) {
        logger.log({ type: 'error', message: err });
	      return reply({error: err});
	    }

	    return reply({status: 'success'});
	  });
  }

  function exit(err) {

    logger.log({ type: 'error', service: 'users', error: err, stack: err.stack || 'No stacktrace' }, process.stderr);
    logger.log({ type: 'info', message: 'killing users service' });

    process.exit();
  }

};
