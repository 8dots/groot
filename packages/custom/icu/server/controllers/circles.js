'use strict';

var config = require('meanio').loadConfig(),
  actionSettings = require(process.cwd() + '/config/actionSettings') || {};

var request = require('request');

var redis = require('redis'),
  client = redis.createClient();

client.on('error', function(err) {
  console.log('Error ' + err);
});


var getCircles = exports.getCircles = function(type, user, callback) {
  var api = '/api/v1/circles/' + type + '?user=' + user;
  client.get(api, function(err, reply) {
    if (reply) return callback(null, reply);
    request(config.circles.uri + api, function(error, response, body) {
      if (error || response.statusCode !== 200) return callback(error || response.statusCode);
      client.setex(api, actionSettings.cacheTime, body, redis.print);
      return callback(null, body);
    });
  });
};

exports.all = function(req, res, next) {
  getCircles('all', req.user.id, function(err, data) {
    return res.send(data);
  })
};

exports.sources = function(req, res, next) {
  getCircles('sources', req.user.id, function(err, data) {
    return res.send(data);
  })
};

exports.mine = function(req, res, next) {
  getCircles('mine', req.user.id, function(err, data) {
    return res.send(data);
  })
};