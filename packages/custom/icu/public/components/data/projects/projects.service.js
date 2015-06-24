'use strict';

angular.module('mean.icu.data.projectsservice', [])
.service('ProjectsService', function(ApiUri, $http) {
    var EnitityPrefix = '/api/projects';

    function getAll() {
        return $http.get(EnitityPrefix).then(function(result) {
            console.log(result.data);
            return result.data;
        });
    }

    function getById(id) {
        return $http.get(EnitityPrefix + '/' + id).then(function(result) {
            return result.data[0];
        });
    }

    function create(project) {
        return $http.post(EnitityPrefix, project).then(function(result) {
            return result.data;
        });
    }

    function update(project) {
        return $http.put(EnitityPrefix + '/' + project._id, project).then(function(result) {
            return result.data;
        });
    }

    function remove(id) {
        return $http.delete(EnitityPrefix + '/' + id).then(function(result) {
            return result.data;
        });
    }

    return {
        getAll: getAll,
        getById: getById,
        create: create,
        update: update,
        remove: remove
    };
});
