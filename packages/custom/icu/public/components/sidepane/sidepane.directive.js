'use strict';

angular.module('mean.icu.ui.sidepane', []).
directive('icuSidepane', function() {
    function controller($scope, $state, context, TasksService, $rootScope, SearchService, $filter) {
        $scope.context = context;
        
        $scope.folders = $scope.folders.data || $scope.folders;
        $scope.offices = $scope.offices.data || $scope.offices;
        $scope.projects = $scope.projects.data || $scope.projects;
        $scope.discussions = $scope.discussions.data || $scope.discussions;
        $scope.officeDocuments = $scope.officeDocuments.data || $scope.officeDocuments;
        //$scope.templateDocs = $scope.templateDocs.data || $scope.templateDocs;
        $scope.people = $scope.people.data || $scope.people;
        $scope.toggleVisibility = function(toggledItem) {
            var prev = toggledItem.open;

            $scope.items.forEach(function(i) {
                i.open = false;
            });

            toggledItem.open = !prev;
        }

        $scope.removeFilterValue = function() {
        	TasksService.filterValue = false;
        }

        $scope.isCurrentState = function(item) {

            if ((context.main === 'templateDocs') && (item.display != undefined) && (item.display[1] === 'templateDocs'))
            {
                return true;
            }
            else if ((context.main === 'offices') && (item.display != undefined) && (item.display[0] === 'offices'))
            {
                return true;
            }

            if (item.state.includes("."))
            {
                return item.state.split(".")[0] === context.main;
            }
            else
            {
                return item.state === context.main;
            }
            
            //return item.state === context.main;
        };

        $scope.GoToMyTasks = function() {
            $state.go('main.tasks.byassign');
        }

        $scope.items = [{
            name: 'tasks',
            icon: '/icu/assets/img/task.png',
            state: 'tasks.all',
            display: ['projects', 'discussions', 'people'],
            open: $scope.isCurrentState({state: 'tasks'})
        }, {
            name: 'projects',
            icon: '/icu/assets/img/project.png',
            state: 'projects.all',
            display: ['discussions', 'people'],
            open: $scope.isCurrentState({state: 'projects'})
        }, {
            name: 'discussions',
            icon: '/icu/assets/img/meeting.png',
            state: 'discussions.all',
            display: ['projects', 'people'],
            open: $scope.isCurrentState({state: 'discussions'})
        },
        {
            name: 'settings',
            icon: '/icu/assets/img/settings.png',
            state: 'folders.all',
            display: ['offices', 'templateDocs'],
            open: $scope.isCurrentState({state: 'folders'})
        },
        // , {
        //     name: 'people',
        //     icon: '/icu/assets/img/people.png',
        //     state: 'people',
        //     display: ['projects', 'discussions'],
        //     open: false
        // }
        {
            name: 'officeDocuments',
            icon: '/icu/assets/img/icon-document.svg',
            state: 'officeDocuments.all',
            display: ['folders'],//['new', 'received', 'inProgress'],
            open: $scope.isCurrentState({state: 'officeDocuments'})
        }
        ];

        /********************************** search **********************************/

        $scope.issues = [
            {label:'tasks', value: true, name: 'task'}, 
            {label:'projects', value: false, name: 'project'},
            {label:'discussions', value: false, name: 'discussion'},
            {label:'offices', value: false, name: 'office'},
            {label:'folders', value: false, name: 'folder'},
            {label:'documents', value:true, name: 'officeDocument'}
        ];
        $scope.filteringData = {
            issue: 'task',
            selectedEntities: {
                projects: {},
                discussions: {},
                folders: {},
                offices: {}
            },
            selectedWatchers: {},
            projects: [],
            discussions: [],
            folders: [],
            offices: [],
            watchers: []
        }
        
        var getEntitiesAndWatchers = function(filteredByType) {
            for (var i=0; i< filteredByType.length; i++) {
                if (filteredByType[i].project)
                    $scope.filteringData.projects.push(filteredByType[i].project);
                if (filteredByType[i].discussions && filteredByType[i].discussions.length)
                    $scope.filteringData.discussions.push(filteredByType[i].discussions[0]);                    
                if (filteredByType[i].folder)
                    $scope.filteringData.folders.push(filteredByType[i].folder);
                if (filteredByType[i].office)
                    $scope.filteringData.offices.push(filteredByType[i].office)
                if (filteredByType[i].watchers && filteredByType[i].watchers.length)
                    $scope.filteringData.watchers = $scope.filteringData.watchers.concat(filteredByType[i].watchers)
            }

            $scope.filteringData.projects = $scope.projects.filter(function(e) {
                return $scope.filteringData.projects.indexOf(e._id) > -1;
            });
            $scope.filteringData.discussions = $scope.discussions.filter(function(e) {
                return $scope.filteringData.discussions.indexOf(e._id) > -1;
            });
            $scope.filteringData.folders = $scope.folders.filter(function(e) {
                return $scope.filteringData.folders.indexOf(e._id) > -1;
            });
            $scope.filteringData.offices = $scope.offices.filter(function(e) {
                return $scope.filteringData.offices.indexOf(e._id) > -1;
            });
            $scope.filteringData.watchers = $scope.people.filter(function(e) {
                return $scope.filteringData.watchers.indexOf(e._id) > -1;
            });

            SearchService.filteringData = $scope.filteringData;
        }

        $scope.filterSearchByType = function() {
            var results = SearchService.results;
            var filteredByType = []
            for (var i=0; i< results.length; i++) {
                if (results[i]._type == $scope.filteringData.issue) {
                    filteredByType.push(results[i])
                }
            }
            SearchService.filteringResults = filteredByType;

            getEntitiesAndWatchers(filteredByType)
        }

        var getTruth = function(obj) { // return truth value in a single object
            var arr = [];
            for (var key in obj) {
                if (obj[key]) {
                    arr.push(key)
                }
            }
            return arr;
        }
        
        $scope.simulateCheckbox = function(obj, value) {
            if (obj[value]) {
                obj[value] = false;
            } else {
                obj[value] = true;
            }
        }

        $scope.filterSearchByEntity = function() {
            var filteringResults = SearchService.filteringResults
            var projects = getTruth($scope.filteringData.selectedEntities.projects);
            var discussions = getTruth($scope.filteringData.selectedEntities.discussions);
            var folders = getTruth($scope.filteringData.selectedEntities.folders);
            var offices = getTruth($scope.filteringData.selectedEntities.offices);
            if (!projects.length && !discussions.length && !folders.length && !offices.length)
                return;
            var filteredByEntity = [];
            for (var i=0; i< filteringResults.length; i++) {
                if (filteringResults[i].project && projects.indexOf(filteringResults[i].project) > -1 ||
                    filteringResults[i].folder && folders.indexOf(filteringResults[i].folder) > -1 ||
                    filteringResults[i].office && offices.indexOf(filteringResults[i].office) > -1)
                        filteredByEntity.push(filteringResults[i]);
                if (filteringResults[i].discussions && filteringResults[i].discussions.length && discussions.indexOf(filteringResults[i].discussions[0]) > -1)
                    filteredByEntity.push(filteringResults[i]);
            }
            SearchService.filteringResults = filteredByEntity;
        }

        $scope.filterSearchByWatcher = function() {
            var filteringResults = SearchService.filteringResults
            var watchers = getTruth($scope.filteringData.selectedWatchers);
            if (!watchers.length) return;
            var filteredByWatchers = [];
            for (var i=0; i< filteringResults.length; i++) {
                if (_.intersection(filteringResults[i].watchers, watchers).length)
                    filteredByWatchers.push(filteringResults[i]);
            }
            SearchService.filteringResults = filteredByWatchers;
        }

        $scope.filterSearch = function() {
            $scope.filterSearchByType();
            $scope.filterSearchByEntity();
            $scope.filterSearchByWatcher();
        }

        $scope.resetFilter = function() {
            $scope.filteringData.selectedEntities = {
                projects: {},
                discussions: {},
                folders: {},
                offices: {}
            };
            $scope.filteringData.selectedWatchers = {};
        }

    }

    return {
        restrict: 'A',
        controller: controller,
        templateUrl: '/icu/components/sidepane/sidepane.html',
        scope: {
            projects: '=',
            discussions: '=',
            offices: '=',
            folders: '=',
            people: '=',
            officeDocuments: '=',
            templateDocs: '=',
            currentState: '@'
        }
    };
});
