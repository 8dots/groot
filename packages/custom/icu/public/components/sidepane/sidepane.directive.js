'use strict';

angular.module('mean.icu.ui.sidepane', []).
directive('icuSidepane', function() {
    function controller($scope, $state, $stateParams,SettingServices, $filter, $location, $rootScope,
        context, SearchService, EntityService, OfficesService, OfficeDocumentsService, MultipleSelectService,
        NotifyingService, TasksService
    ){
        $scope.version = window.config.version;
        $scope.context = context;
        $scope.recycled = $stateParams.recycled;

        $scope.folders = $scope.folders.data || $scope.folders;
        $scope.offices = $scope.offices.data || $scope.offices;
        $scope.tasks = $scope.tasks.data || $scope.tasks;
        $scope.projects = $scope.projects.data || $scope.projects;
        $scope.attachments = $scope.officeDocuments.data || $scope.officeDocuments;
        $scope.discussions = $scope.discussions.data || $scope.discussions;
        $scope.officeDocuments = $scope.officeDocuments.data || $scope.officeDocuments;
        //$scope.templateDocs = $scope.templateDocs.data || $scope.templateDocs;
        $scope.people = $scope.people.data || $scope.people;
        $scope.removeFilterValue = function() {
            TasksService.filterValue = false;
        };

        $scope.datePicker = {};

        $scope.dateoptions = {
            eventHandlers: {
                'apply.daterangepicker': function (ev, picker) {
                    SearchService.filterDateOption = $scope.datePicker.date;
                }
            },
            opens : "top"
        };
        // activeToggle
        $scope.activeToggleList = EntityService.activeToggleList;
        $scope.activeToggle = {
            field: !EntityService.isActiveStatusAvailable() ? 'all' : $stateParams.activeToggle || 'all',
            disabled: !EntityService.isActiveStatusAvailable()
        };

        $scope.GoToMyTasks = function() {
            $state.go('main.tasks.byassign');
        };

        $scope.initMenuItem = function(item){
          $scope.removeFilterValue();
          if(item.func)item.func();
        };

        $scope.clearAllFilters = function(){
            $scope.filteringData.issue='all';
            $scope.resetFilter();
            $scope.filterSearchByType();

            $scope.showM('empty');
            $scope.filterActive('All');
            $scope.filterSearchByType(true);

            $scope.clearDueDate();
            $scope.clearUpdatedDate();
            $scope.clearDateRange();

            $scope.turnOffRecycle();
        };

        $scope.checkForSearchState = function(){
          if($state.current.name.indexOf('search') === -1){
            $scope.clearAllFilters();
            $scope.clearResults();
          }
        };

        $scope.items = [{
            name: 'search',
            icon: '/icu/assets/img/search-nav.svg',
            state: 'search',
            display: ['projects', 'discussions', 'people'],
            func: $scope.checkForSearchState,
        }, {
            name: 'tasks',
            icon: '/icu/assets/img/task.png',
            state: 'tasks.all',
            display: ['projects', 'discussions', 'people']
        }, {
            name: 'projects',
            icon: '/icu/assets/img/project.png',
            state: 'projects.all',
            display: ['discussions', 'people']
        }, {
            name: 'meetings',
            icon: '/icu/assets/img/meeting.png',
            state: 'discussions.all',
            display: ['projects', 'people']
        }, {
            name: 'officeDocuments',
            icon: '/icu/assets/img/icon-document.svg',
            state: 'officeDocuments.all',
            display: ['folders']
        }, {
            name: 'settings',
            icon: '/icu/assets/img/settings.png',
            state: 'folders.all',
            display: ['offices', 'templateDocs']
        }
    ];

    setActiveTab($state.current)

    /********************************** search **********************************/

    $scope.issues = [
        {label:'tasks', value: false, name: 'task', length: 0},
        {label:'projects', value: false, name: 'project', length: 0},
        {label:'discussions', value: false, name: 'discussion', length: 0},
        {label:'officeDocuments', value: false, name: 'officeDocument', length: 0},
        {label:'folders', value: false, name: 'folder', length: 0},
        {label:'offices', value: false, name: 'office', length: 0},
        {label:'Attachments', value: false, name: 'attachment', length: 0}
    ];

    $scope.filteringData = {
        issue: $location.$$search && $location.$$search.type ? $location.$$search.type : 'all',
        selectedEntities: {
            projects: {},
            discussions: {},
            folders: {},
            attachments: {},
            offices: {},
        },
        selectedWatchers: {},
        projects: [],
        discussions: [],
        folders: [],
        offices: [],
        watchers: []
    };

    $scope.displayLimit = {
        tasks : 4,
        projects : 4,
        discussions : 4,
        offices: 4,
        folders: 4,
        watchers: 2,
        people: 2,
        default : {
            tasks: 4,
            projects: 4,
            discussions: 4,
            offices: 4,
            folders: 4,
            attachments: 4,
            watchers: 2,
            people: 2,
        }
    };

    let getEntitiesAndWatchers = function(filteredByType) {
        for (let i=0; i< filteredByType.length; i++) {
            if (filteredByType[i].project)
            $scope.filteringData.projects.push(filteredByType[i].project);
            if (filteredByType[i].discussions && filteredByType[i].discussions.length)
            $scope.filteringData.discussions.push(filteredByType[i].discussions[0]);
            if (filteredByType[i].folder)
            $scope.filteringData.folders.push(filteredByType[i].folder);
            if (filteredByType[i].office)
            $scope.filteringData.offices.push(filteredByType[i].office);
            if (filteredByType[i].attachment)
            $scope.filteringData.attachments.push(filteredByType[i].attachment);
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

        $scope.filteringData.attachments = $scope.attachments.filter(function(e) {
            return $scope.filteringData.offices.indexOf(e._id) > -1;
        });

        $scope.filteringData.watchers = $scope.people.filter(function(e) {
            return $scope.filteringData.watchers.indexOf(e._id) > -1;
        });

        SearchService.filteringData = $scope.filteringData;
    };

    $state.current.reloadOnSearch = false;

    let issuesOrder = $scope.issues.map(function(i) {
        return i.name;
    });

    $scope.filterSearchByType = function(flag) {
        $state.go($state.current, {
            type: $scope.filteringData.issue === 'all' ? null : $scope.filteringData.issue
        }, {
            reload: false
        })

        let results = SearchService.results;

        for (let i = 0; i < $scope.issues.length; i++) {
          $scope.issues[i].length = 0;
        }

        if (!results || !results.length) return ;
        let filteredByType = [], index;

        for (let i=0; i< results.length; i++) {
            if (results[i]._type === $scope.filteringData.issue || $scope.filteringData.issue === 'all') {
                if ($rootScope.status) {
                    if ($rootScope.status == 'all' ){
                        if ($scope.userFilterList.indexOf(results[i].status) > -1) {
                            filteredByType.push(results[i]);
                        }
                    }
                    else if ($rootScope.status == 'active' ){
                        let activeList = $scope.activeList;
                        if(activeList.indexOf(results[i].status)>-1){
                            filteredByType.push(results[i]);
                          }
                    }
                    else if ($rootScope.status == 'nonactive' ){
                        let archiveList = $scope.archiveList;
                        if(archiveList.indexOf(results[i].status)>-1){
                            filteredByType.push(results[i]);
                          }
                    }
                    else if(results[i].status == $rootScope.status){
                        filteredByType.push(results[i]);
                    }
                }
                else filteredByType.push(results[i]);
            }
            index = issuesOrder.indexOf(results[i]._type);
            if($stateParams.query === ''){
              $scope.issues[index].length = 0;
            } else if($scope.issues[index]){
                identifyRecycled(results[i], $scope.issues[index]);
            }
        }
        SearchService.setFilteringResults(filteredByType);
        SearchService.filteringResults = filteredByType;

        getEntitiesAndWatchers(filteredByType);
        if (!flag && $rootScope.status )
          $rootScope.$emit('changeStatus');
    };

    function identifyRecycled(item, issue){
      if($scope.recycled && item.recycled){
        issue.length++
      } else if(!$scope.recycled && !item.recycled){
        issue.length++
      }
    }

    let getTruth = function(obj) { // return truth value in a single object
        let arr = [];
        for (let key in obj) {
            if (obj[key]) {
                arr.push(key);
            }
        }
        return arr;
    };

    $scope.filterSearchByEntity = function() {
        let filteringResults = SearchService.filteringResults;
        let projects = getTruth($scope.filteringData.selectedEntities.projects);
        let discussions = getTruth($scope.filteringData.selectedEntities.discussions);
        let folders = getTruth($scope.filteringData.selectedEntities.folders);
        let offices = getTruth($scope.filteringData.selectedEntities.offices);
        if (!projects.length && !discussions.length && !folders.length && !offices.length)
        return;
        let filteredByEntity = [];
        for (let i=0; i< filteringResults.length; i++) {
            if (filteringResults[i].project && projects.indexOf(filteringResults[i].project) > -1 ||
            filteringResults[i].folder && folders.indexOf(filteringResults[i].folder) > -1 ||
            filteringResults[i].office && offices.indexOf(filteringResults[i].office) > -1)
            filteredByEntity.push(filteringResults[i]);
            if (filteringResults[i].discussions && filteringResults[i].discussions.length && discussions.indexOf(filteringResults[i].discussions[0]) > -1)
            filteredByEntity.push(filteringResults[i]);
        }
        SearchService.filteringResults = filteredByEntity;
    };

    $scope.filterSearchByWatcher = function() {
        let filteringResults = SearchService.filteringResults;
        let watchers = getTruth($scope.filteringData.selectedWatchers);
        if (!watchers.length) return;
        let filteredByWatchers = [];
        for (let i=0; i< filteringResults.length; i++) {
            if (_.intersection(filteringResults[i].watchers, watchers).length)
            filteredByWatchers.push(filteringResults[i]);
        }
        SearchService.filteringResults = filteredByWatchers;
    };

    $scope.updatedOptions = {
        onClose: (value/*, picker, $element*/) => {
            let date = new Date(value.split('/').reverse().join('-'));
            SearchService.filteringByUpdated = $scope.updatedDate = date;
            document.getElementById('ui-datepicker-div').style.display = 'block';
            $scope.$apply();
        },
        dateFormat: 'dd/mm/yy'
    };

    $scope.updateDueDate = {
        onClose: (value/*, picker, $element*/) => {
            let date = new Date(value.split('/').reverse().join('-'));
            SearchService.filteringByDueDate = $scope.dueDate = date;
            document.getElementById('ui-datepicker-div').style.display = 'block';
            $scope.$apply();
        },
        dateFormat: 'dd/mm/yy'
    };

    $scope.filterActive = function(type) {
         $scope.activeToggle.field = type;
         EntityService.activeStatusFilterValue = $scope.activeToggle.field ;
         $state.go($state.current.name, { activeToggle: $scope.activeToggle.field });
    };

    $scope.toggleRecycle = function () {
        var query = SearchService.getQuery();
        console.log("toggleRecycle...") ;

        $scope.recycled = $scope.isRecycled = $stateParams.recycled = !$stateParams.recycled;

        if($scope.recycled === false) {
            $state.go('main.search', {
                recycled: null,
                query: query
            }, {
                reload: true
            });
        } else {
            let usedQuery;
            if(query === ''){
              usedQuery = '___';
            } else {
              usedQuery = query;
            }
            $state.go('main.search', {
                recycled: true,
                query: usedQuery
            }, {
                reload: true
            });
        }
    };

    $scope.clearResults = function(){
      SearchService.refreshQuery('');
      SearchService.clearResults();

      $scope.issues = $scope.issues.map(function(issue){
        issue.length = 0;
        return issue;
      });
      return $scope.issues;
    };

    $scope.filterSearch = function() {
        $scope.filterSearchByType();
        $scope.filterSearchByEntity();
        $scope.filterSearchByWatcher();
    };

    $scope.resetFilter = function() {
        $scope.filteringData.selectedEntities = {
            projects: {},
            discussions: {},
            folders: {},
            attachments: {},
            offices: {}
        };
        $scope.filteringData.selectedWatchers = {};

        NotifyingService.notify('refreshAfterOperation');
    };

    $scope.closeSearch = function(){
        $state.go('main.tasks')
    };

    $rootScope.$on('$stateChangeSuccess', function (event, toState) {
        if (toState.name.indexOf('search') > -1) {
            $scope.filterSearch();
        }
        setActiveTab(toState);
    });

    $rootScope.$emit('Login');

    function setActiveTab(state) {
        let active = state.name.split('.')[1];
        if(['folders', 'offices', 'templateDocs'].includes(active)) {
            active = 'settings';
        }
        if(active === 'discussions') active = 'meetings';
        $scope.activeTab = $scope.items.find(item => item.name === active);
    }

}

return {
    restrict: 'A',
    controller: controller,
    templateUrl: '/icu/components/sidepane/sidepane.html',
    scope: {
        me: '=',
        tasks: '=',
        projects: '=',
        discussions: '=',
        offices: '=',
        folders: '=',
        people: '=',
        officeDocuments: '=',
        templateDocs: '=',
        changeLayout: '=',
        getSideMenuIcon: '=',
        filterSearchByType: '=',
        filterSearchByEntity: '=',
        filterSearchByWatcher: '=',
        filterSearch: '=',
        filteringData: '=',
        resetFilter: '=',
        getEntitiesAndWatchers: '=',
        datePicker: '=',
        tmpStatus: '=',
        statusList: '=',
        activeList: '=',
        archiveList: '='
    }
};
});
