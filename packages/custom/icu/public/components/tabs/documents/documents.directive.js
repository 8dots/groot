'use strict';

angular.module('mean.icu.ui.tabs')
    .directive('icuTabsDocuments', function () {
        function controller($scope) {
            $scope.isOpen = {};
            $scope.trigger = function (document) {
                $scope.isOpen[document._id] = !$scope.isOpen[document._id];
            };
        }

        return {
            restrict: 'A',
            scope: {
                documents: '='
            },
            replace: true,
            controller: controller,
            templateUrl: '/icu/components/tabs/documents/documents.html'
        };
    });
