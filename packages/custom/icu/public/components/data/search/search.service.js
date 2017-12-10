'use strict';

angular.module('mean.icu.data.searchservice', [])
.service('SearchService', function($http, ApiUri, WarningsService) {

	var  builtInSearchArray = false;
    var filteringData = [];
    var results = []
    var filteringResults = [];

    function find(query) {
        var _this = this;
        return $http.get(ApiUri + '/search?term=' + query).then(function(result) {
            WarningsService.setWarning(result.headers().warning);
            var results = [];
            for (var property in result.data) {
                result.data[property].forEach(function(entity) {
                    entity._type = property;
                    results.push(entity);
                });
            }
            _this.results = _this.filteringResults = results;
            return results;
        });
    }

    return {
        find: find,
        builtInSearchArray: builtInSearchArray,
        filteringData: filteringData,
        filteringResults: filteringResults
    };
});



