'use strict';

angular.module('mean.icu.data.officedocumentsservice', [])
.service('OfficeDocumentsService', function(ApiUri, $http, PaginationService, TasksService, $rootScope, WarningsService) {
    var EntityPrefix = '/officeDocuments';
    var data, selected;

    function getAll(start, limit, sort) {
        var qs = querystring.encode({
            start: start,
            limit: limit,
            sort: sort
        });

        if (qs.length) {
            qs = '?' + qs;
        }
        return $http.get(ApiUri + EntityPrefix + qs).then(function (result) {
        	WarningsService.setWarning(result.headers().warning);
        	console.log($rootScope.warning, '$rootScope.warning')
            return result.data;
        }, function(err) {return err}).then(function (some) {
            var data = some.content ? some : [{title:"sraya"}];
            //result.data = some.content ? some : [];
            return data;
        });
    }

    function getById(id) {
        return $http.get(ApiUri + EntityPrefix + '/' + id).then(function(result) {
        	WarningsService.setWarning(result.headers().warning);
            return result.data;
        });
    }

    function getByEntityId(entity) {
        return function(id, start, limit, sort) {
            var qs = querystring.encode({
                start: start,
                limit: limit,
                sort: sort
            });

            if (qs.length) {
                qs = '?' + qs;
            }

            var url = ApiUri + '/' + entity + '/' + id + EntityPrefix;

            return $http.get(url + qs).then(function(result) {
            	WarningsService.setWarning(result.headers().warning);
                return result.data;
            });
        }
    }

    function create(odocument) {
        return $http.post(ApiUri + EntityPrefix, odocument).then(function(result) {

        	WarningsService.setWarning(result.headers().warning);
            return result.data;
        });
    }


    function update(odocument) {
        return $http.put(ApiUri + EntityPrefix + '/' + odocument._id, odocument).then(function(result) {
        	WarningsService.setWarning(result.headers().warning);
            return result.data;
        });
    }

    function remove(id) {
        return $http.delete(ApiUri + EntityPrefix + '/' + id).then(function(result) {
        	WarningsService.setWarning(result.headers().warning);
            return result.data;
        });
    }

    return {
        getAll: getAll,
        getById: getById,
        getByDiscussionId: getByEntityId('discussions'),
        getByUserId: getByEntityId('users'),
        getByProjectId: getByEntityId('projects'),
        getByOfficeId: getByEntityId('offices'),
        create: create,
        update: update,
        remove: remove,
        data: data,
        selected: selected
    };
});
