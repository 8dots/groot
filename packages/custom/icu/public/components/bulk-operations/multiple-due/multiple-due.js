'use strict';


angular.module('mean.icu.ui.bulkoperations')
    .directive('multipleDue', function () {
        function multipleDueController($scope, MultipleSelectService, NotifyingService) {
            $scope.type = 'due';
            $scope.selectedItems = $scope.$parent.selectedItems;

            refreshAllowed();
            $scope.$on('refreshSelectedList', function (event) {
              refreshAllowed();
            });

            function refreshAllowed(){
              return $scope.allowed = MultipleSelectService.haveBulkPerms($scope.type);
            }
        }
        return {
            controller: multipleDueController,
            templateUrl: '/icu/components/bulk-operations/bulk-operations-button.html',
            restrict: 'E',
            scope:{
                entityType: "="
            }
        };
    });


