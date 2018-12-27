
'use strict';

var _ = require('lodash');
var  mean = require('meanio');

var TaskModel = require('../models/task.js');
var ProjectModel = require('../models/project.js');
var DiscussionModel = require('../models/discussion.js');
var OfficeDocumentsModel = require('../models/document.js');
var FolderModel = require('../models/folder');
var OfficeModel = require('../models/office');
var TemplateDocsModel = require('../models/templateDoc');
var elasticsearch = require('../controllers/elasticsearch');


var entityNameMap = {
  tasks: {
    mainModel: TaskModel,
    //      archiveModel: TaskArchiveModel,
    name: 'task'
  },
  projects: {
    mainModel: ProjectModel,
    //      archiveModel: ProjectArchiveModel,
    name: 'project'
  },
  discussions: {
    mainModel: DiscussionModel,
    //      archiveModel: DiscussionArchiveModel,
    name: 'discussion'
  },
  officeDocuments: {
    mainModel: OfficeDocumentsModel,
    //      archiveModel: OfficeDocumentsArchiveModel,
    name: 'officeDocument'
  },
  folders: {
    mainModel: FolderModel,
    //      archiveModel: OfficeDocumentsArchiveModel,
    name: 'folder'
  },
  offices: {
    mainModel: OfficeModel,
    //      archiveModel: OfficeDocumentsArchiveModel,
    name: 'office'
  },
  templateDocs: {
    mainModel: TemplateDocsModel,
    //      archiveModel: OfficeDocumentsArchiveModel,
    name: 'templateDoc'
  }
};

function recycleEntity(entityType, id) {
  var Model = entityNameMap[entityType].mainModel;
  var name = entityNameMap[entityType].name;
  // var promise = Model.update({'_id':id},{$set:{'recycled': Date.now()}}).exec();
  // elasticsearch.save(this, name);
  // return promise ; 

  switch(entityType) {
    case 'projects':
    //delete related tasks
    removeFromSingleEntities('tasks','project',id);
    ///delete dissctaion
    removeFromSingleEntities('discussions','project',id);
      break;
    case 'folders':
      //delete document
      removeFromSingleEntities('officeDocuments','folder',id);
      break;
    case "discussions":
      //delete folder
      removeFromSingleEntities('folders','discussion',id);
      //delete project
      removeFromSingleEntities('projects','discussion',id);
       //delete projects
      removeFromArrayEntities('projects','discussions',id);
      //delete tasks
      removeFromSingleEntities('tasks','discussion',id);
      removeFromArrayEntities('tasks','discussions',id);
      break;
    case 'offices':
     //delete folder
     removeFromSingleEntities('folders','office',id);
     //TODO: delete Signature 
    //  removeOfficesFromEntities('folders',id);
     //delete TemplateDoc
     removeFromSingleEntities('templateDocs','office',id);
     break;
    case 'documents':
         //delete task
        removeFromArrayEntities('tasks','officeDocuments',id);
        //delete doc
        removeFromArrayEntities('documents','relatedDocuments',id);
     break;
  }
  var promise =
    Model.findOne({
      _id: id
    }).exec(function(error, entity) {
      entity.recycled = Date.now();
      entity.save(function(err) {
        if(err) {
          console.log(err);
        }
        else  elasticsearch.save(entity, name);
      });
    });
  return promise;

}

function removeFromSingleEntities(type,field,id){
  entityNameMap[type].mainModel.update({
    [field]: id
  }, {
    [field]: null
  }, {multi: true}).exec();

}
function removeFromArrayEntities(type,field,id){
  entityNameMap[type].mainModel.update({
    [field]: id 
  }, {
    $pull: {[field]: id}
  }, {multi: true}).exec();

}



function recycleRestoreEntity(entityType, id) {
  var Model = entityNameMap[entityType].mainModel;
  var name = entityNameMap[entityType].name;
  let promise = Model.findOneAndUpdate(
    {_id: id},
    {$unset: {recycled: ''}},
    {new: true}, function(err, entity) {
      if(err) {
        console.log(err);
      }
      console.log('entity unrecycled');
      elasticsearch.save(entity, name);
    });
  return promise;
}

// function recycleRestoreEntity(entityType, id) {
//         var Model = entityNameMap[entityType].mainModel;
//         var name = entityNameMap[entityType].name;
//         var promise =
//           Model.findOne({
//             _id: id
//         }).exec(function (error, entity) {
//           entity.recycled = null
//           delete entity.recycled;
//           entity.update({ _id: id }, { $unset : { recycled : ""} })
//           .then(function(err) {
//             console.log("unrecycle entity.update")
//             console.log(err)
//             if (err) {
//               console.log(err);
//             }
//              else elasticsearch.save(entity, name);

//           });

//         });
//        return promise ;
// }


function recycleGetBin(entityType) {
  var request = [];
  return new Promise(function(fulfill, reject) {
    for(let key in entityNameMap) {
      let Model = entityNameMap[key].mainModel;
      request.push(new Promise(function(resolve, error) {
        Model.find({recycled: {$exists: true}}).exec(function(err, entities) {
          if(err) {
            error('error');
          }


          // add type entity support for recycle bin
          let typedEntities = entities.map(function(entity) {
            var json = JSON.stringify(entity);
            let typedEntity = JSON.parse(json);
            typedEntity['type'] = entityNameMap[key].name;
            return typedEntity;
          });
          resolve(typedEntities);
        });
      }));
    }
    Promise.all(request).then(function(result) {
      fulfill(result);
    }).catch(function(reason) {
      reject('reject');
    });
  });
}



module.exports = {
  recycleEntity: recycleEntity,
  recycleRestoreEntity: recycleRestoreEntity,
  recycleGetBin: recycleGetBin,
};
