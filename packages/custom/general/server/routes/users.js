'use strict';

// User routes use users controller
var config = require('meanio').loadConfig(),
  apiUri = config.api.uri,
  request = require('request');

module.exports = function(MeanUser, app, auth, database) {

  app.route('/api/signout')
    .get(function(req, res) {
      var objReq = {
        uri: apiUri + '/api/logout',
        method: 'GET',
        headers: {
          host: req.headers.host,
          connection: req.headers.connection,
          authorization: req.headers.authorization,
          cookie: req.headers.cookie,
          'if-none-match': req.headers['if-none-match']
        }
      };

      request(objReq, function(error, response, body) {
        if (!error && response.statusCode === 200 && response.body.length) {
          res.redirect('/');
        }
      });
    });

  // Setting up the users api
  app.route('/api/signup')
    .post(function(req, res) {

      var objReq = {
        uri: apiUri + '/api/register',
        method: 'POST',
        form: req.body
      };

      request(objReq, function(error, response, body) {
        if (!error && response.statusCode === 200 && response.body.length) {
          return res.json(JSON.parse(response.body));
        }
      });
    });

  // Setting the local strategy route
  app.route('/api/signin')
    .post(function(req, res) {

      var objReq = {
        uri: apiUri + '/api/login',
        method: 'POST',
        form: req.body
      };

      request(objReq, function(error, response, body) {
        if (!error && response.statusCode === 200 && response.body.length) {
          return res.json(JSON.parse(response.body));
        }
      });
    });

};