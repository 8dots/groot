'use strict';
console.log('hhj')
angular.module('mean.icu.ui.tasklist')
.controller('TaskListController', function($scope, $state, tasks, projects, ProjectsService) {
        console.log('controller')
        console.log(projects, 'projects')
    $scope.tasks = _(tasks).map(function(t) {
        t.project = _(projects).find(function(p) { return p._id === t.project; });
        return t;
    });

    if ($scope.tasks.length && $state.current.name === 'main.tasks') {
        $state.go('main.tasks.details', { id: $scope.tasks[0]._id });
    }
});
