'use strict';

var project = require('../controllers/project');
var task = require('../controllers/task');
var comment = require('../controllers/comments');
var discussion = require('../controllers/discussion');
var profile = require('../controllers/profile');
var users = require('../controllers/users');
var updates = require('../controllers/updates');
var notification = require('../controllers/notification');
var attachments = require('../controllers/attachments');
var star = require('../controllers/star');
var elasticsearch = require('../controllers/elasticsearch');
var templates = require('../controllers/templates');
var eventDrops = require('../controllers/event-drops');
var office = require('../controllers/office');

var authorization = require('../middlewares/auth.js');
var locals = require('../middlewares/locals.js');
var entity = require('../middlewares/entity.js');
var response = require('../middlewares/response.js');
var pagination = require('../middlewares/pagination.js');
var error = require('../middlewares/error.js');
var config = require('meanio').loadConfig(),
  circleSettings = require(process.cwd() + '/config/circleSettings') || {};
var order = require('../controllers/order');
var express = require('express')

//update mapping - OHAD
//var mean = require('meanio');
//var elasticActions = require('../controllers/elastic-actions.js');
//END update mapping - OHAD

//socket
// var socket = require('../middlewares/socket.js');

module.exports = function(Icu, app) {
  var circles = require('circles-npm')(app, config.circles.uri, circleSettings);

  var hi = require('root-notifications')({
      rocketChat: config.rocketChat
  }, app);

  // /^((?!\/hi\/).)*$/ all routes without '/api/hi/*'
  app.route(/^((?!\/hi\/).)*$/).all(locals);
  app.route(/^((?!\/hi\/).)*$/).all(authorization);

  //app.route(/^((?!\/hi\/).)*$/).all(authorization, socket);

  //app.route(/^((?!\/socket.io\/).)*$/).all(locals);
  //app.route(/^((\/socket.io\/).)*$/).all(authorization);

  // When need to update mapping, use this authorization, and not the abouve one
  // app.route(/^((\/index-data\/).)*$/).all(authorization);

  //update mapping - OHAD
  app.post('/api/index-data/:schema', function(req, res) {
    elasticActions.indexData(req, res, mean.elasticsearch);
  });
  //END update mapping - OHAD

  app.route('/api/:entity(tasks|discussions|projects|users|circles|files|attachments|updates|templates|myTasksStatistics|event-drops|offices)*').all(circles.acl());

  app.use('/api/files', attachments.getByPath, error, express.static(config.attachmentDir));

  //update socket - OHAD
  // app.route('/api/socket.io/')
  // .post(socket)
  // .get(socket);
  //END update socket - OHAD

  //Notification READ - OHAD
  app.route('/api/notification/:id([0-9a-fA-F]{24})')
    .get(notification.read)
    .put(notification.updateIsWatched);
  app.route('/api/notification1/:id([0-9a-fA-F]{24})')
    .put(notification.updateDropDown);
  //END Notification READ - OHAD

  //star & get starred list
  app.route('/api/:entity(tasks|discussions|projects|offices)/:id([0-9a-fA-F]{24})/star')
    .patch(star.toggleStar);
  app.route('/api/:entity(tasks|discussions|projects|offices)/starred')
    .get(pagination.parseParams, star.getStarred, pagination.formResponse);
  app.route('/api/:entity(tasks|discussions|projects|offices)/starred/:type(byAssign)')
    .get(pagination.parseParams, star.getStarred, pagination.formResponse);

  //Create HI Room if the user wish  
  app.route('/api/:entity(tasks|discussions|projects)/:id([0-9a-fA-F]{24})/WantToCreateRoom')
    //.post(project.read, notification.createRoom);
    .post(project.read);

  //Create HI Room if the user wish  
  app.route('/api/:entity(offices)/:id([0-9a-fA-F]{24})/WantToCreateRoom')
    //.post(project.read, notification.createRoom);
    .post(office.read)

  app.route('/api/projects*').all(entity('projects'));
  app.route('/api/projects')
  //.all(auth.requiresLogin, permission.echo)
  .post(project.create, updates.created)
    .get(pagination.parseParams, project.all, star.isStarred, pagination.formResponse);
  app.route('/api/projects/:id([0-9a-fA-F]{24})')
    .get(project.read, star.isStarred)
  //.put(project.read, project.update, star.isStarred)
  .put(project.read, project.update, attachments.sign, notification.updateRoom, star.isStarred)
    .delete(star.unstarEntity, project.read, project.destroy);
  app.route('/api/history/projects/:id([0-9a-fA-F]{24})')
    .get(project.readHistory);
  app.route('/api/:entity(tasks|discussions|projects)/:id([0-9a-fA-F]{24})/projects')
    .get(pagination.parseParams, project.getByDiscussion, project.getByEntity, pagination.formResponse);
  app.route('/api/:entity(tasks|discussions|projects)/:id([0-9a-fA-F]{24})/projects/starred')
    .get(pagination.parseParams, star.getStarredIds('projects'), project.getByDiscussion, project.getByEntity, pagination.formResponse);

  app.route('/api/offices*').all(entity('offices'));
  app.route('/api/offices')
  //.all(auth.requiresLogin, permission.echo)
  .post(office.create, updates.created)
    .get(pagination.parseParams, office.all, star.isStarred, pagination.formResponse);
  app.route('/api/offices/:id([0-9a-fA-F]{24})')
    .get(office.read, star.isStarred)
  //.put(project.read, project.update, star.isStarred)
  .put(office.read, office.update, attachments.sign, notification.updateRoom, star.isStarred)
    .delete(star.unstarEntity, office.read, office.destroy);
  app.route('/api/history/offices/:id([0-9a-fA-F]{24})')
    .get(office.readHistory);
  app.route('/api/:entity(tasks|discussions|offices)/:id([0-9a-fA-F]{24})/offices')
    .get(pagination.parseParams, office.getByDiscussion, office.getByEntity, pagination.formResponse);
  app.route('/api/:entity(tasks|discussions|offices)/:id([0-9a-fA-F]{24})/offices/starred')
    .get(pagination.parseParams, star.getStarredIds('offices'), office.getByDiscussion, office.getByEntity, pagination.formResponse);

  app.route('/api/tasks*').all(entity('tasks'));
  app.route('/api/tasks')
    .post(task.create, task.updateParent, notification.sendNotification, updates.created)
    .get(pagination.parseParams, task.all, star.isStarred, pagination.formResponse);
  app.route('/api/tasks/tags')
    .get(task.tagsList);
  app.route('/api/tasks/zombie')
    .get(task.getZombieTasks, star.isStarred);
  app.route('/api/tasks/:id([0-9a-fA-F]{24})')
    .get(task.read, star.isStarred)
    .put(task.read, task.update, star.isStarred, attachments.sign, updates.updated, notification.updateTaskNotification)
    .delete(star.unstarEntity, task.read, task.removeSubTask, task.destroy);
  app.route('/api/tasks/byAssign')
    .get(task.byAssign);

  // app.route('/api/tasks/subtasks')
  // 	.post(task.addSubTasks)
  app.route('/api/tasks/subtasks/:id([0-9a-fA-F]{24})')
  	.get(task.getSubTasks)

  app.route('/api/:entity(discussions|projects|offices|users)/:id([0-9a-fA-F]{24})/tasks')
    .get(pagination.parseParams, task.getByEntity, pagination.formResponse);
  app.route('/api/:entity(discussions|projects|offices|users)/:id([0-9a-fA-F]{24})/tasks/starred')
    .get(pagination.parseParams, star.getStarredIds('tasks'), task.getByEntity, pagination.formResponse);
  app.route('/api/history/tasks/:id([0-9a-fA-F]{24})')
    .get(task.readHistory);

  app.route('/api/comments/*').all(entity('comments'));
  app.route('/api/comments')
    .post(comment.create)
    .get(comment.all);
  app.route('/api/comments/:id([0-9a-fA-F]{24})')
    .get(comment.read)
    .put(comment.update)
    .delete(comment.destroy);
  app.route('/api/history/comments/:id([0-9a-fA-F]{24})')
    .get(comment.readHistory);

  app.route('/api/avatar')
    .post(profile.profile, profile.uploadAvatar, profile.update);

  app.route('/api/users*').all(entity('users'));
  app.route('/api/users')
    .post(users.filterProperties, users.create)
    .get(users.all);
  app.route('/api/users/:id([0-9a-fA-F]{24})')
    .get(users.read)
    .put(users.read, users.filterProperties, users.update)
    .delete(users.read, users.destroy);
  app.route('/api/:entity(tasks|discussions|projects|offices)/:id([0-9a-fA-F]{24})/users')
    .get(users.getByEntity);

  app.route('/api/attachments*').all(entity('attachments'));
  app.route('/api/attachments')
    .post(attachments.upload, attachments.signNew, attachments.create)
    .get(attachments.all);
  app.route('/api/attachments/:id([0-9a-fA-F]{24})')
    .get(attachments.read)
    .post(attachments.read, attachments.upload, attachments.update)
    .delete(attachments.deleteFile)
  app.route('/api/history/attachments/:id([0-9a-fA-F]{24})')
    .get(attachments.readHistory);
  app.route('/api/:entity(tasks|discussions|projects|offices)/:id([0-9a-fA-F]{24})/attachments')
    .get(attachments.getByEntity);
  app.route('/api/tasks/myTasks/attachments')
    .get(attachments.getMyTasks)

  app.route('/api/search')
    .get(elasticsearch.search);

  app.route('/api/discussions*').all(entity('discussions'));
  app.route('/api/discussions')
    .post(discussion.create, updates.created)
    .get(pagination.parseParams, discussion.all, star.isStarred, pagination.formResponse);
  app.route('/api/history/discussions/:id([0-9a-fA-F]{24})')
    .get(discussion.readHistory);
  app.route('/api/discussions/:id([0-9a-fA-F]{24})')
    .get(discussion.read, star.isStarred)
    .put(discussion.read, discussion.update, star.isStarred, attachments.sign, updates.updated)
    .delete(star.unstarEntity, discussion.read, discussion.destroy);
  app.route('/api/discussions/:id([0-9a-fA-F]{24})/schedule')
    .post(discussion.read, discussion.schedule, discussion.update, updates.updated);
  app.route('/api/discussions/:id([0-9a-fA-F]{24})/summary')
    .post(discussion.read, discussion.summary, discussion.update, updates.updated);
  app.route('/api/discussions/:id([0-9a-fA-F]{24})/cancele')
    .post(discussion.read, discussion.cancele, discussion.update, updates.updated);
  app.route('/api/:entity(projects)/:id([0-9a-fA-F]{24})/discussions')
    .get(pagination.parseParams, discussion.getByProject, discussion.getByEntity, star.isStarred, pagination.formResponse); //, discussion.getByEntity);
  app.route('/api/:entity(projects)/:id([0-9a-fA-F]{24})/discussions/starred')
    .get(pagination.parseParams, star.getStarredIds('discussions'), discussion.getByProject, discussion.getByEntity, pagination.formResponse); //, discussion.getByEntity);

  app.route('/api/updates*').all(entity('updates'));
  app.route('/api/updates')
    .post(updates.signNew, updates.create, notification.sendUpdate)
  // .post(updates.create, notification.sendUpdate)
  .get(updates.all, updates.getAttachmentsForUpdate);
  app.route('/api/updates/:id([0-9a-fA-F]{24})')
    .get(updates.read, updates.getAttachmentsForUpdate)
    .put(updates.update);
  app.route('/api/tasks/myTasks/updates')
    .get(updates.getMyTasks)
  //     // .delete(updates.destroy);
  app.route('/api/:entity(tasks|discussions|projects|offices)/:id([0-9a-fA-F]{24})/updates')
    .get(updates.getByEntity, updates.getAttachmentsForUpdate);
  app.route('/api/history/updates/:id([0-9a-fA-F]{24})')
    .get(updates.readHistory);

  app.route('/api/tasks/:id([0-9a-fA-F]{24})/toTemplate')
    .post(templates.toTemplate);
  app.route('/api/templates/:id([0-9a-fA-F]{24})')
    .delete(templates.read, templates.removeSubTask, templates.destroy);
  app.route('/api/templates/:id([0-9a-fA-F]{24})/toSubTasks')
    .post(templates.toSubTasks);
  app.route('/api/templates')
    .get(pagination.parseParams, templates.all, pagination.formResponse);

  //temporary -because of swagger bug with 'tasks' word

  app.route('/api/task/tags')
    .get(task.tagsList);
  app.route('/api/task/zombie')
    .get(task.getZombieTasks);
  app.route('/api/task/:id([0-9a-fA-F]{24})')
    .get(task.read)
    .put(task.update)
    .delete(task.destroy);

  app.route('/api/myTasksStatistics')
    .get(task.myTasksStatistics);
  app.route('/api/overdueWatchedTasks')
    .get(task.getOverdueWatchedTasks);
  app.route('/api/watchedTasks')
    .get(task.getWatchedTasksList);
  app.route('/api/order/set')
    .post(order.set);
  app.route('/api/event-drops')
    .get(eventDrops.getMyEvents);


  app.route(/^((?!\/hi\/).)*$/).all(response);
  app.route(/^((?!\/hi\/).)*$/).all(error);

  //app.use(utils.errorHandler);
};
