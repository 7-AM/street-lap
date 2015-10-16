/**
 * TO-DOS
 * (1) set timeouts in case services are not responding
 */

var router    	= require('express').Router();
var logger    	= require('logfmt');
var jwt       	= require('express-jwt');
var url 				= require('url');
var qs 					= require( "qs" );
var querystring = require("querystring");

module.exports = function(exchange, serviceTime) {

	router.route('/users')
		.post(function(req,res) {

			exchange.publish({ user: req.body }, {
		    key: 'api.post.user',
		    reply: function( data ) {
					if (data.error) {

						res.status(422);
						res.json({
							error: {
								request_url: '/api/users',
								type: 'unexpected error occur',
								code: 422,
								message: data.error
							}
						});

						return;
					}

					return res.send(data.user);
				}
		  });
		})
		.get(function(req,res) {

			exchange.publish(req.query, {
		    key: 'api.get.user',
		    reply: function(data) {

					if (data.error) {

						res.status(422);
						res.json({
							error: {
								request_url: '/api/users',
								type: 'unexpected error occur',
								code: 422,
								message: data.error
							}
						});

						return;
					}

					return res.send(data.users);
				}
		  });
		});

	/* Single post routes */
	router.route('/users/:user_id')
		.get(function(req, res) {

			exchange.publish({ id: req.params.user_id }, {
		    key: 'api.get.user.id',
		    reply: function(data) {

					if (data.error) {

						res.status(422);
						res.json({
							error: {
								request_url: '/api/users',
								type: 'unexpected error occur',
								code: 422,
								message: data.error
							}
						});

						return;
					}

					res.send(data.user);
				}
		  });
		})
		.put(function(req, res) {

			exchange.publish({ id: req.params.user_id, update: req.body }, {
		    key: 'api.put.user',
		    reply: function(data) {

					if (data.error) {

						res.status(422);
						res.json({
							error: {
								request_url: '/api/users',
								type: 'unexpected error occur',
								code: 422,
								message: data.error
							}
						});

						return;
					}

					res.send(data.user);
				}
		  });

		})
		.delete(function(req, res) {
			exchange.publish({ id: req.params.user_id }, {
		    key: 'api.delete.user',
		    reply: function(data) {
					res.send(data);
				}
		  });
		});

	return router;

};
