'use strict';

function ProjectListController($scope, $state, $timeout, projects, NotifyingService, BoldedService, MultipleSelectService, ProjectsService, UsersService, context, $stateParams, EntityService) {

    let me;
    UsersService.getMe().then(function(result) {
      me = result;
    });

    $scope.items = projects.data || projects;

    var subProjects = [];
    $scope.items.forEach(function (item) {
        if (item.subProjects && item.subProjects.length > 0) {
            return subProjects = subProjects.concat(item.subProjects.filter(function (subProject) {
                return subProject !== 'undefined';
            }));
        }
    });

    $scope.loadNext = projects.next;
    $scope.loadPrev = projects.prev;

    $scope.entityName = 'projects';
    $scope.entityRowTpl = '/icu/components/project-list/project-row.html';

    var creatingStatuses = {
        NotCreated: 0,
        Creating: 1,
        Created: 2
    }

    $scope.getBoldedClass = function(entity){
      return BoldedService.getBoldedClass(entity, 'projects');
    };

    $scope.update = function(item) {
        return ProjectsService.update(item);
    }

    $scope.create = function(parent) {

        var newItem = {
            title: '',
            color: '0097A7',
            watchers: [],
            __state: creatingStatuses.NotCreated,
            __autocomplete: true
        };
        if(parent){
            newItem[parent.type] = parent.id;
        }
        return ProjectsService.create(newItem).then(function(result) {
            $scope.items.push(result);
            ProjectsService.data.push(result);
            return result;
        });
    };

  $scope.loadMore = function(start, LIMIT, sort) {
    return new Promise((resolve) => {
      if (!$scope.isLoading && $scope.loadNext) {
        $scope.isLoading = true;

        return $scope.loadNext()
          .then(function(items) {
            _(items.data).each(function(p) {
              p.__state = creatingStatuses.Created;
            });

            var offset = $scope.displayOnly ? 0 : 1;

            if (items.data.length) {
              var index = $scope.items.length - offset;
              var args = [index, 0].concat(items.data);

              [].splice.apply($scope.items, args);
            }

            $scope.loadNext = items.next;
            $scope.loadPrev = items.prev;
            $scope.isLoading = false;

            return resolve(items.data);
          });
      }
      return resolve([]);
    })
  };
}

angular.module('mean.icu.ui.projectlist', []).controller('ProjectListController', ProjectListController);
