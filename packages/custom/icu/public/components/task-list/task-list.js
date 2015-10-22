'use strict';

angular.module('mean.icu.ui.tasklist', [])
.controller('TaskListController', function ($scope, $state, tasks, TasksService, context, $filter, $stateParams) {
    $scope.tasks = tasks.data || tasks;
    $scope.loadNext = tasks.next;
    $scope.loadPrev = tasks.prev;

    $scope.autocomplete = context.entityName === 'discussion';

    $scope.showStarred = false;

    $scope.isCurrentState = function(id) {
        return $state.current.name.indexOf('main.tasks.byentity') === 0 &&
            $state.current.name.indexOf('details') === -1;
    };

    $scope.changeOrder = function () {
        $scope.sorting.isReverse = !$scope.sorting.isReverse;
    };

    $scope.sorting = {
        field: 'created',
        isReverse: false
    };

    $scope.taskOrder = function(task) {
        if (task._id && $scope.sorting) {
            var parts = $scope.sorting.field.split('.');
            var result = task;
            for (var i = 0; i < parts.length; i+=1) {
                if (result) {
                    result = result[parts[i]];
                } else {
                    result = undefined;
                }
            }

            //HACK: instead of using array of 2 values, this code concatenates
            //2 values
            //Reason: inconsistency in sorting results between sorting by one param
            //and array of params
            return result + task.title;
        }
    };

    //HACK: impure function that sorts and modifies array itself
    function sort() {
        var result = $filter('orderBy')($scope.tasks, $scope.taskOrder);
        Array.prototype.splice.apply($scope.tasks, [0, $scope.tasks.length].concat(result));
    }

    sort();
    $scope.$watch('sorting.field', function() {
        sort();
    });

    $scope.sortingList = [
        {
            title: 'due',
            value: 'due'
        }, {
            title: 'project',
            value: 'project.title'
        }, {
            title: 'title',
            value: 'title'
        }, {
            title: 'status',
            value: 'status'
        }, {
            title: 'created',
            value: 'created'
        }
    ];

    function navigateToDetails(task, isStarred) {
        $scope.detailsState = context.entityName === 'all' ? 'main.tasks.all.details' : 'main.tasks.byentity.details';

        $state.go($scope.detailsState, {
            id: task._id,
            entity: $scope.currentContext.entityName,
            entityId: $scope.currentContext.entityId,
            starred: isStarred
        });
    }

    $scope.starredOnly = function () {
        $scope.showStarred = !$scope.showStarred;
        if ($scope.showStarred) {
            TasksService.getStarred().then(function(starred) {
                $scope.tasks = _(tasks).reduce(function(list, item) {
                    var contains = _(starred).any(function(s) {
                        return s._id === item._id;
                    });

                    if (contains) {
                        list.push(item);
                    }

                    return list;
                }, []);
                if ($scope.tasks[0]) {
                    navigateToDetails($scope.tasks[0], true);
                }
            });
        } else {
            $scope.tasks = tasks;
            if ($scope.tasks[0]) {
                navigateToDetails($scope.tasks[0], false);
            }
        }
    };

    if ($stateParams.starred) {
        $scope.starredOnly();
    }

    if ($scope.tasks.length) {
        if ($state.current.name === 'main.tasks.all' ||
            $state.current.name === 'main.tasks.byentity') {
            navigateToDetails($scope.tasks[0]);
        }
    } else if (
            $state.current.name !== 'main.tasks.byentity.activities' &&
            $state.current.name !== 'main.tasks.byentity.tasks') {
        $state.go('.activities');
    }
});
