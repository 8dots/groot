function bulkOperationsController($scope, $i18next, $uibModalInstance, selectedItems, activityType, entityName, MultipleSelectService) {

    $scope.selectedItems = selectedItems;
    $scope.activityType = activityType;
    $scope.entityName = entityName;

    $scope.statusMap = {
        tasks: ['new', 'assigned', 'in-progress', 'review', 'rejected', 'done'],
        projects: ['new', 'assigned', 'in-progress', 'canceled', 'completed', 'archived'],
        discussions: ['new', 'scheduled', 'done', 'canceled', 'archived'],
        officeDocuments: ['new', 'in-progress', 'received', 'sent', 'done'],
        folders: ['new', 'in-progress', 'canceled', 'completed', 'archived'],
        offices: ['new', 'in-progress', 'canceled', 'completed', 'archived'],
        templateDocuments: ['new', 'in-progress', 'canceled', 'completed', 'archived']
    };

    $scope.statuses = $scope.statusMap[$scope.entityName];

    $scope.select = function(selected){
        $scope.selected = selected;
    };

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };

    $scope.bulkUpdate = function(type, value) {
        let idsArray = $scope.selectedItems.map(entity => entity._id);
        let changedBulkObject = {
            update: {},
            ids: idsArray
        };
        changedBulkObject.update[type] = value;

        MultipleSelectService.bulkUpdate(changedBulkObject, $scope.entityName).then(result=>{
            for(let i = 0; i < selectedItems.length; i++){
                let entity = result.find(entity => entity._id === selectedItems[i]._id);
                Object.assign(selectedItems[i], entity);
            }
        });

        $uibModalInstance.dismiss('cancel');
    };

    switch(activityType){
        case 'status':
            $scope.title = 'Set Status';
            break;
        case 'watch':
            $scope.title = 'Set Watchers';
            break;
        case 'assign':
            $scope.title = 'Assign to';
            break;
        case 'due':
            $scope.title = 'Set Due Date';
            break;
        case 'tag':
            $scope.title = 'Add tags';
            break;
        case 'delete':
            $scope.title = `${$i18next('Delete')} ${selectedItems.length} ${entityName}`;
            break;
    }
}
