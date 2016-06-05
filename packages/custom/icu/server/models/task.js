'use strict';

var mongoose = require('mongoose'),
  Schema = mongoose.Schema,
  archive = require('./archive.js'),
  request = require('request');

var TaskSchema = new Schema({
  created: {
    type: Date,
    default: Date.now
  },
  updated: {
    type: Date
  },
  title: {
    type: String
  },
  project: {
    type: Schema.ObjectId,
    ref: 'Project'
  },
  parent: {
    type: Schema.ObjectId,
    ref: 'Task'
  },
  creator: {
    type: Schema.ObjectId,
    ref: 'User'
  },
  manager: {
    type: Schema.ObjectId,
    ref: 'User'
  },
  tags: [String],
  status: {
    type: String,
    enum: ['new', 'assigned', 'in-progress', 'review', 'rejected', 'done'],
    default: 'new'
  },
  due: {
    type: Date
  },
  //should we maybe have finer grain control on this
  watchers: [{
    type: Schema.ObjectId,
    ref: 'User'
  }],
  groups: {
    type: Array
  },
  comp: {
    type: Array
  },
  assign: {
    type: Schema.ObjectId,
    ref: 'User'
  },
  description: {
    type: String
  },
  discussions: [{
    type: Schema.ObjectId,
    ref: 'Discussion'
  }]
});

var starVirtual = TaskSchema.virtual('star');
starVirtual.get(function() {
  return this._star;
});
starVirtual.set(function(value) {
  this._star = value;
});
TaskSchema.set('toJSON', {
  virtuals: true
});
TaskSchema.set('toObject', {
  virtuals: true
});

/**
 * Statics
 */
TaskSchema.statics.load = function(id, cb) {
  this.findOne({
    _id: id
  }).populate('creator', 'name username')
    .populate('assign', 'name username').exec(cb);
};
TaskSchema.statics.project = function(id, cb) {
  require('./project');
  var Project = mongoose.model('Project');
  Project.findById(id, function(err, project) {
    cb(err, project || {});
  });
};
/**
 * Post middleware
 */
var elasticsearch = require('../controllers/elasticsearch');

TaskSchema.post('save', function(req, next) {
  var task = this;
  TaskSchema.statics.project(this.project, function(err, project) {
    if (err) {
      return err;
    }

    console.log("task================================");
    console.log(task);

    elasticsearch.save(task, 'task', project.room);
  });
  next();
});

var buildConditions = function(conditions) {
  var ObjectId = mongoose.Types.ObjectId;
  var userId = new ObjectId(conditions.currentUser._id);
  var groups = conditions.currentUser.circles && conditions.currentUser.circles.groups ? conditions.currentUser.circles.groups : [];
  var comp = conditions.currentUser.circles && conditions.currentUser.circles.comp ? conditions.currentUser.circles.comp : [];
  conditions['$or'] = [{
    'creator': userId
  }, {
    'manager': userId
  }, {
    'assign': userId
  }, {
    'watchers': userId
  }
  , {
    $and: [{
      'groups': {
        $in: groups
      }
    }, {
      'comp': {
        $in: comp
      }
    }]
  }
  ];
  delete conditions.currentUser;
  return (conditions);
};

TaskSchema.pre('find', function(next) {
  if (this._conditions.currentUser) {
    this._conditions = buildConditions(this._conditions)
  }
  console.log('--------------------------------------------Task----------------------------------------------------------')
  console.log(JSON.stringify(this._conditions))
  next();
});

TaskSchema.pre('count', function(next) {
  if (this._conditions.currentUser) {
    this._conditions = buildConditions(this._conditions)
  }
  console.log('--------------------------------------------Count-Task---------------------------------------------------------')
  console.log(JSON.stringify(this._conditions))
  next();
});

//  var elasticsearch = require('../controllers/elasticsearch');

// TaskSchema.post('/api/save', function(req, res) {

//       var objReq = {
//         uri: apiUri + '/api/save',
//         //uri: 'http://192.168.245.152/api/save',
//         method: 'POST',
//         form: req.body
//       };

//       var task = this;

//       request(objReq, function(error, response, body) {
//         if (error) {
//             return error;
//         }
//         if(response){}

//       });
//     });     

//  TaskSchema.post('save', function (req, next) {

//   var task = this;
//   TaskSchema.statics.project(this.project, function (err, project) {
//     if (err) {
//       return err;
//     }

//       elasticsearch.save(task, 'task', project.room);
//   });
//   next();
// });

TaskSchema.pre('remove', function(next) {
  var task = this;
  TaskSchema.statics.project(this.project, function(err, project) {
    if (err) {
      return err;
    }
    elasticsearch.delete(task, 'task', project.room, next);
  });
  next();
});

TaskSchema.plugin(archive, 'task');

module.exports = mongoose.model('Task', TaskSchema);