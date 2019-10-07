'use strict';

angular.module('mean.icu.ui.folderdetails', []).controller('FolderDetailsController', FolderDetailsController);

function FolderDetailsController($rootScope, $scope, entity, me, tasks, people, folders, offices, $timeout, context, $state, FoldersService, PermissionsService, $stateParams, OfficesService, ActivitiesService, EntityService, DetailsPaneService) {

  // ==================================================== init ==================================================== //

  $scope.tabs = DetailsPaneService.orderTabs(['activities', 'documents', 'officeDocuments']);

  let currentState = $state.current.name;

  if (($state.$current.url.source.includes("search")) || ($state.$current.url.source.includes("folders"))) {
    $scope.item = entity || context.entity;
  } else {
    $scope.item = context.entity || entity;
  }

  if (!$scope.item) {
    $state.go('main.folders.byentity', {
      entity: context.entityName,
      entityId: context.entityId
    });
  }

  $scope.options = {
    theme: 'bootstrap',
    buttons: ['bold', 'italic', 'underline', 'anchor', 'quote', 'orderedlist', 'unorderedlist']
  };
  $scope.statuses = ['new', 'in-progress', 'canceled', 'done', 'archived'];

  $scope.entity = entity || context.entity;
  $scope.tasks = tasks.data || tasks;
  $scope.items = folders.data || folders;
  $scope.offices = offices.data || offices;

  // backup for previous changes - for updates
  var backupEntity = angular.copy($scope.item);

  $scope.people = people.data || people;

  $scope.updateCurrentFolder = function(){
    FoldersService.currentFolderName = $scope.item.title;
  }

  FoldersService.getTags().then(result =>
    $scope.tags = result
  );

  FoldersService.getStarred().then(function(starred) {
    $scope.item.star = _(starred).any(function(s) {
      return s._id === $scope.item._id;
    });
  });

  // ==================================================== onChanges ==================================================== //

  $scope.onStar = function(value) {

    $scope.update($scope.item, {
      name: 'star'
    });

    FoldersService.star($scope.item).then(function () {
      $state.reload();
    });
  }

  $scope.onStatus = function(value) {
    $scope.item.status = value;
    $scope.update($scope.item, {
      name: 'status'
    })
  }

  $scope.onColor = function(value) {
    $scope.update($scope.item, value);
  }

  $scope.onWantToCreateRoom = function() {
    $scope.item.WantRoom = true;

    $scope.update($scope.item, context);

    FoldersService.WantToCreateRoom($scope.item).then(function(data) {
      $state.reload();
      if(data.roomName) {
        $window.open(window.config.rocketChat.uri + '/group/' + data.roomName);
        return true;
      }
      else {
        return false;
      }
    });
};

  $scope.onTags = function(value) {
    $scope.item.tags = value;
    $scope.update($scope.item, {
      name: 'tags'
    });
  }

  // ==================================================== Menu events ==================================================== //

    $scope.recycle = function() {
        EntityService.recycle('folders', $scope.item._id).then(function() {
            $scope.item.recycled = new Date();
            let clonedEntity = angular.copy($scope.item);
            clonedEntity.status = "Recycled";
            // just for activity status
            FoldersService.updateStatus(clonedEntity, $scope.item).then(function(result) {
                ActivitiesService.data.push(result);
            });
            refreshList();
            $state.go('^.^');
            $scope.isRecycled = $scope.item.hasOwnProperty('recycled');
            $scope.permsToSee();
            $scope.havePermissions();
            $scope.haveEditiorsPermissions();
        });
    };

    $scope.recycleRestore = function() {
        EntityService.recycleRestore('folders', $scope.item._id).then(function() {
            let clonedEntity = angular.copy($scope.item);
            clonedEntity.status = "un-deleted";
            // just for activity status
            FoldersService.updateStatus(clonedEntity, $scope.item).then(function(result) {
                ActivitiesService.data.push(result);
            });
            refreshList();
            $state.go('^.^');
        });
    }

    function refreshList() {
        $rootScope.$broadcast('refreshList');
    }

  $scope.menuItems = [{
    label: 'deleteFolder',
    fa: 'fa-times-circle',
    display: !$scope.item.hasOwnProperty('recycled'),
    action: $scope.recycle,
  },{
    label: 'Say Hi!',
    icon: 'chat',
    display: true,
    action: $scope.onWantToCreateRoom
  },{
    label: 'unrecycleFolder',
    fa: 'fa-times-circle',
    display: $scope.item.hasOwnProperty('recycled'),
    action: $scope.recycleRestore,
  }];

  // ==================================================== Category ==================================================== //

  function unionById(arr1, arr2){
    let existing = arr1.map(e => (e.id || e._id).toString());
    arr2.forEach(e => {
      let id = (e.id || e._id).toString();
      if(!existing.includes(id)) {
        arr1.push(e);
      }
    })
    return arr1;
  }

  $scope.onCategory = function(value) {

    if (value) {
      $scope.item.office = value;
      $scope.item.watchers = unionById($scope.item.watchers, $scope.item.office.watchers);
      $scope.item.permissions = unionById($scope.item.permissions, $scope.item.office.permissions);
    } else {
      $scope.item.office = {}
    }

    FoldersService.update($scope.item).then(function(result) {
        backupEntity = angular.copy($scope.item);
      let officeId = result.office ? result.office._id : undefined;
      $state.reload();
    });
  };

  // ==================================================== $watch: title / desc ==================================================== //

  $scope.$watch('item.title', function(nVal, oVal) {
    if (nVal !== oVal) {
      delayedUpdateTitle($scope.item, {
        name: 'title',
        oldVal: oVal,
        newVal: nVal,
        action: 'renamed'
      });
      FoldersService.currentFolderName = $scope.item.title;
    }
  });

  $scope.$watch('item.description', function(nVal, oVal) {
    if (nVal !== oVal) {
      delayedUpdateDesc($scope.item, {
        name: 'description',
        oldVal: oVal,
        newVal: nVal,
        action: 'renamed'
      });
    }
  });

  // ==================================================== Update ==================================================== //

  $scope.update = function(folder, context) {
    if (context.name === 'color') {
      folder.color = context.newVal;
    }
    FoldersService.update(folder, context).then(function(res) {
      if (FoldersService.selected && res._id === FoldersService.selected._id) {
        if (context.name === 'title') {
          FoldersService.selected.title = res.title;
        }
      }
      switch (context.name) {
        case 'status':
          FoldersService.updateStatus(folder, me, backupEntity).then(function(result) {
            backupEntity = angular.copy($scope.item);
            ActivitiesService.data = ActivitiesService.data || [];
            ActivitiesService.data.push(result);
            refreshList();
          });
          break;

        case 'star':
          FoldersService.updateStar(folder, me, backupEntity).then(function(result) {
            backupEntity = angular.copy($scope.item);
            ActivitiesService.data = ActivitiesService.data || [];
            ActivitiesService.data.push(result);
          });
          break;

        case 'title':
          FoldersService.updateTitle(folder, me, backupEntity).then(function(result) {
            backupEntity = angular.copy($scope.item);
            ActivitiesService.data = ActivitiesService.data || [];
            ActivitiesService.data.push(result);
          });
          break;

        case 'description':
          FoldersService.updateDescription(folder, me, backupEntity).then(function(result) {
            backupEntity = angular.copy($scope.item);
            ActivitiesService.data = ActivitiesService.data || [];
            ActivitiesService.data.push(result);
          });
          break;

        case 'tags':
          FoldersService.updateTags(folder, me, backupEntity).then(function(result) {
            backupEntity = angular.copy($scope.item);
            ActivitiesService.data = ActivitiesService.data || [];
            ActivitiesService.data.push(result);
          });
          break;
      }
    });
  }

  var delayedUpdateTitle = _.debounce($scope.update, 2000);
  var delayedUpdateDesc = _.debounce($scope.update, 2000);

  // ==================================================== havePermissions ==================================================== //

  $scope.enableRecycled = true;
  $scope.havePermissions = function(type, enableRecycled) {
    if (entity) {
      enableRecycled = enableRecycled || !$scope.isRecycled;
      return (PermissionsService.havePermissions(entity, type) && enableRecycled);
    }
  }

  $scope.haveEditiorsPermissions = function() {
    return PermissionsService.haveEditorsPerms($scope.entity);
  }

  $scope.permsToSee = function() {
    return PermissionsService.haveAnyPerms($scope.entity);
  }

}
