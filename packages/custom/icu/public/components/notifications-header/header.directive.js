'use strict';

angular.module('mean.icu.ui.notificationsheader', [])
.directive('icuNotificationsHeader', function (NotificationsService,
                                               TasksService,
                                               UsersService,
                                               $state,
                                               $stateParams,
                                               context,
                                               ProjectsService,
                                               DiscussionsService,
                                               $document) {
    function controller($scope) {
        $scope.notifications = NotificationsService.getAll();
        $scope.popupNotifications = $scope.notifications.slice(0, -1);
        $scope.lastNotification = $scope.notifications[$scope.notifications.length - 1];
        $scope.context = context;
        $scope.allNotifications = false;

        $scope.triggerDropdown = function () {
            $scope.allNotifications = !$scope.allNotifications;
        };

        UsersService.getMe().then(function (me) {
            $scope.me = me;
        });

        $scope.logout = function () {
            UsersService.logout().then(function () {
                $state.go('login');
            });
        };

        var entities = {
            projects: 'project',
            discussions: 'discussion',
            tasks: 'task'
        };

        $scope.createTask = function () {
            var task = {
                title: '',
                watchers: [],
                tags: []
            };

            var state = 'main.tasks.all.details'; // tasks.all
            var params = {
                entity: 'task'
            };

            if (context.entityName === 'all') {
                if (context.main === 'tasks') {
                    // tasks.all
                    state = 'main.tasks.all.details';
                    params.entity = 'task';
                } else {
                    // discussions.all, projects.all
                    state = 'main.tasks.byentity.details';
                    params.entityId = $stateParams.id;
                    params.entity = entities[context.main];
                    task[params.entity] = $stateParams.id;
                }
            } else {
                // tasks.projects, tasks.discussions, discussions.projects, projects.discussions
                state = 'main.tasks.byentity.details';
                params.entity = $stateParams.entity;
                params.entityId = $stateParams.entityId;
                task[$stateParams.entity] = $stateParams.entityId;
            }

            TasksService.create(task).then(function (result) {
                params.id = result._id;
                $state.go(state, params, {reload: true});
            });
        };

        $scope.createProject = function () {
            var project = {
                color: 'b9e67d',
                title: '',
                watchers: [],
            };
            var state;
            var params = {};

            if (context.entityName === 'all') {
                if (context.main === 'projects') {
                    // projects.all
                    state = 'main.projects.all.details';
                    params.entity = 'project';
                } else {
                    // discussions.all, tasks.all
                    state = 'main.projects.byentity.details';
                    params.entityId = $stateParams.id;
                    params.entity = entities[context.main];
                    project[params.entity] = $stateParams.id;
                }
            } else {
                // tasks.projects, tasks.discussions, discussions.projects, projects.discussions
                state = 'main.projects.byentity.details';
                params.entity = $stateParams.entity;
                params.entityId = $stateParams.entityId;
                project[$stateParams.entity] = $stateParams.entityId;
            }

            ProjectsService.create(project).then(function (result) {
                $scope.projects.push(result);
            	params.id = result._id;
                $state.go(state, params, {reload: true});
            });
        };

        $scope.createDiscussion = function () {
            var discussion = {
                title: '',
                watchers: [],
            };
            var state;
            var params = {};

            if (context.entityName === 'all') {
                if (context.main === 'discussions') {
                    // discussions.all
                    state = 'main.discussions.all.details';
                    params.entity = 'discussion';
                } else {
                    // projects.all, tasks.all
                    state = 'main.discussions.byentity.details';
                    params.entityId = $stateParams.id;
                    params.entity = entities[context.main];
                    discussion[params.entity] = $stateParams.id;
                }
            } else {
                // tasks.projects, tasks.discussions, discussions.projects, projects.discussions
                state = 'main.discussions.byentity.details';
                params.entity = $stateParams.entity;
                params.entityId = $stateParams.entityId;
                discussion[$stateParams.entity] = $stateParams.entityId;
            }
            DiscussionsService.create(discussion).then(function (result) {
                $scope.discussions.push(result);
                params.id = result._id;
                $state.go(state, params, {reload: true});
            });
        };
    }

    function link($scope, $element) {
        var list = $element.find('.last-notification');
        var chevron = $element.find('.time');

        $document.on('click', function(e) {
            if(!(list[0].contains(e.target) || chevron[0].contains(e.target))) {
                $scope.allNotifications = false;
                $scope.$apply();
            }
        });
    }

    return {
        restrict: 'A',
        scope: {
            createState: '@',
            discussions: '=',
            projects: '='
        },
        link: link,
        controller: controller,
        templateUrl: '/icu/components/notifications-header/header.html'
    };
});
