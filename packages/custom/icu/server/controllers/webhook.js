var _ = require('lodash');
var mongoose = require('mongoose');
var Task = mongoose.model('Task');
var crud = require('../controllers/crud.js');
var crudService = require('../services/crud.js');
var templates = require('../controllers/templates');

exports.create = function(req, res, next) {

  if(req.locals.error) {
    return next();
  }
  req.body.watchers = [req.user];
  req.body.assign = req.user;
  req.body.circles = {};
  req.body.entity = req.body.entity || req.query.entity || 'task';
  if(req.query.project) req.body.project = req.query.project;

  var options = {
    includes: 'assign watchers project subTasks discussions',
    defaults: {
      project: req.query.project || undefined,
      assign: undefined,
      discussions: [],
      watchers: [],
      circles: {}
    },
  };
  var entity = crud(req.body.entity.toLowerCase() + 's', options);
  if(req.body.custom && req.body.custom.id) {
    var entityService = crudService(req.body.entity.toLowerCase() + 's', options);
    entityService
      .read(null, req.user, req.acl, {'custom.id': req.body.custom.id})
      .then(function(e) {
        if(_.isEmpty(e)) {
          entity.create(req, res, next);
        } else {
          req.locals.result = req.locals.result || {};
          req.locals.result = e;
          entity.update(req, res, next);
        }

      })
      .catch(function(err) {
        next(err);
      });
  } else entity.create(req, res, next);
};


exports.subTasks = function(req, res, next) {
  var task = req.locals.result;
  if (!req.body.template) return next();
  req.body.templates = req.body.templates.split(',');
  if (req.locals.error) return next();
  if (req.body.templates) {
    req.params.id = req.body.templates[0];
    req.body.taskId = task._id;

    templates.toSubTasks(req, res, next, function(err, data) {
      if (err) {
        req.locals.error = err;
        return next();
      }
      Task.update({
        _id: task._id}, {$set: {
        subTasks: data
      }}).exec(function(err, res) {
        if (err) req.locals.error = err;
        else {
          req.locals.result = task;
          req.locals.result.subTasks = data;
        }
        next();
      });
    });
  } else next();
}
