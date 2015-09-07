'use strict';

angular.module('mean.icu.ui.tasklistdirective', [])
.directive('icuTaskList', function ($state, $uiViewScroll, $stateParams) {
    function controller($scope, context, TasksService) {
        $scope.context = context;

        var creatingStatuses = {
            NotCreated: 0,
            Creating: 1,
            Created: 2
        };

        _($scope.tasks).each(function(t) {
            t.__state = creatingStatuses.Created;
        });

        var newTask = {
            title: '',
            watchers: [],
            tags: [],
            __state: creatingStatuses.NotCreated,
            __autocomplete: true
        };

        $scope.taskOrder = function(task) {
            if (task._id && $scope.order) {
                var parts = $scope.order.field.split('.');
                var result = task;
                for (var i = 0; i < parts.length; i+=1) {
                    if (result) {
                        result = result[parts[i]];
                    } else {
                        result = undefined;
                    }
                }

                return result;
            }
        };

        if (!$scope.displayOnly) {
            $scope.tasks.push(_(newTask).clone());
        }

        $scope.detailsState = context.entityName === 'all' ? 'main.tasks.all.details' : 'main.tasks.byentity.details';

        $scope.createOrUpdate = function(task) {
            if (context.entityName !== 'all') {
                task[context.entityName] = context.entity;
            }

            if (task.__state === creatingStatuses.NotCreated) {
                task.__state = creatingStatuses.Creating;

                return TasksService.create(task).then(function(result) {
                    task.__state = creatingStatuses.Created;

                    $scope.tasks.push(_(newTask).clone());

                    return task;
                });
            } else if (task.__state === creatingStatuses.Created) {
                return TasksService.update(task);
            }
        };

        $scope.initialize = function(task) {
            if ($scope.displayOnly) {
                return;
            }

            if (task.__state === creatingStatuses.NotCreated) {
                $scope.createOrUpdate(task).then(function() {
                    $state.go($scope.detailsState, {
                        id: task._id,
                        entity: context.entityName,
                        entityId: context.entityId
                    });
                });
            } else {
                $state.go($scope.detailsState, {
                    id: task._id,
                    entity: context.entityName,
                    entityId: context.entityId
                });
            }
        };

        $scope.searchResults = [];

        $scope.search = function(term) {
            if (context.entityName !== 'discussion') {
                return;
            }

            if (!term) {
                return;
            }

            $scope.searchResults.length = 0;

            TasksService.search(term).then(function(searchResults) {
                _(searchResults).each(function(sr) {
                    var alreadyAdded = _($scope.tasks).any(function(t) {
                        return t._id === sr._id;
                    });

                    if (!alreadyAdded) {
                        $scope.searchResults.push(sr);
                    }
                });
            });
        };

        $scope.select = function(selectedTask) {
            var currentTask = _($scope.tasks).find(function(t) {
                return t.__autocomplete;
            });

            TasksService.remove(currentTask._id);

            _(currentTask).assign(selectedTask);
            currentTask.__autocomplete = false;

            $scope.searchResults.length = 0;

            $scope.createOrUpdate(currentTask).then(function(task) {
                $state.go('main.tasks.byentity.details', {
                    id: task._id,
                    entity: context.entityName,
                    entityId: context.entityId
                });
            });
        };
    }

    function link($scope, $element) {
        var isScrolled = false;

        $scope.isCurrentState = function (id) {
            var isActive = ($state.current.name.indexOf('main.tasks.byentity.details') === 0 ||
                            $state.current.name.indexOf('main.tasks.all.details') === 0
                       ) && $state.params.id === id;

            if (isActive && !isScrolled) {
                $uiViewScroll($element.find('[data-id="' + $stateParams.id + '"]'));
                isScrolled = true;
            }

            return isActive;
        };

        $scope.onEnter = function($event, index) {
            if ($event.keyCode === 13 || $event.keyCode === 9) {
                $event.preventDefault();

                $scope.tasks[index].__autocomplete = false;

                $element.find('td.name')[index+1].focus();
            }
        };
    }

    return {
        restrict: 'A',
        templateUrl: '/icu/components/task-list-directive/task-list.directive.template.html',
        scope: {
            tasks: '=',
            drawArrow: '=',
            groupTasks: '=',
            order: '=',
            displayOnly: '=',
            autocomplete: '='
        },
        link: link,
        controller: controller
    };
});
