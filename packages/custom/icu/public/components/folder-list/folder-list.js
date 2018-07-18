'use strict';

function FolderListController($scope, $state, folders, FoldersService, context, $stateParams, OfficesService, MultipleSelectService) {

    $scope.items = folders.data || folders;

    $scope.entityName = 'folders';
    $scope.entityRowTpl = '/icu/components/folder-list/folder-row.html';

    var creatingStatuses = {
        NotCreated: 0,
        Creating: 1,
        Created: 2
    };

    $scope.update = function(item) {
        return FoldersService.update(item);
    };

    $scope.create = function(parent) {
        var newItem = {
            title: '',
            color: '0097A7',
            watchers: [],
            __state: creatingStatuses.NotCreated,
            __autocomplete: true
        };
        if(parent)newItem.office = parent;
        return FoldersService.create(newItem).then(function(result) {
            $scope.items.push(result);
            FoldersService.data.push(result);
            return result;
        });
    }

    $scope.refreshSelected = function (entity) {
        MultipleSelectService.refreshSelectedList(entity);
        $scope.$broadcast('refreshList', {})
    };

    $scope.$on('changeCornerState', function(event, cornerState){
        setAllSelected(cornerState === 'all');
    });

    function setAllSelected(status){
        for(let i = 0; i < $scope.items.length; i++){
            $scope.items[i].selected = status;
        }
        MultipleSelectService.changeAllSelectedLIst(MultipleSelectService.getNoneRecycledItems($scope.items));
    }

    $scope.loadMore = function(start, LIMIT, sort) {
        return OfficesService.getAll(start, LIMIT, sort).then(function(docs) {
            $scope.items.concat(docs);
            return $scope.items;
        });
    }
}

angular.module('mean.icu.ui.folderlist', []).controller('FolderListController', FolderListController);
