'use strict';

angular.module('mean.icu.ui.middlepane', [])
.directive('icuMiddlepane', function() {
  function controller() {
  }

  return {
    restrict: 'A',
    controller: controller,
    templateUrl: 'icu/components/middlepane/middlepane.html'
  };
});

function MiddlepaneController() {
}

angular.module('mean.icu.ui.middlepane')
.controller('MiddlepaneController', MiddlepaneController);
