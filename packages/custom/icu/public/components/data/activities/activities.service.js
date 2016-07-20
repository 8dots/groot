'use strict';

angular.module('mean.icu.data.activitiesservice', [])
.service('ActivitiesService', function (ApiUri, $http, UsersService) {
    var EntityPrefix = '/updates';

    function getByUserId(id) {
        return [];
    }

    function getUser(updates) {
        return UsersService.getAll().then(function(users) {
            return updates.map(function (u) {
                u.user = _(users).find(function (c) {
                    return c._id === u.creator;
                });
                return u;
            });
        });
    }

    function getById(id) {
        return $http.get(ApiUri + EntityPrefix + '/' + id).then(function(result) {
            return getUser([result.data]).then(function(updates) {
                return updates[0];
            });
        });
    }

    function getByProjectId(id) {
        return $http.get(ApiUri + '/projects/' + id + EntityPrefix).then(function(updatesResult) {
            return getUser(updatesResult.data);
        });
    }

    function getByTaskId(id) {
        return $http.get(ApiUri + '/tasks/' + id + EntityPrefix).then(function(updatesResult) {
            return getUser(updatesResult.data);
        });
    }

    function getByTasks() {
        return $http.get(ApiUri + '/tasks/myTasks'  + EntityPrefix).then(function(updatesResult) {
            return getUser(updatesResult.data);
        });
    }

    function getByDiscussionId(id) {
        return $http.get(ApiUri + '/discussions/' + id + EntityPrefix).then(function(updatesResult) {
            return getUser(updatesResult.data);
        });
    }

    function create(update) {
        return $http.post(ApiUri + EntityPrefix, update).then(function (result) {
            var id = result.data._id;

            return getById(id).then(function(result) {
                return result;
            });
        });
    }

    return {
        getById: getById,
        getByUserId: getByUserId,
        getByTaskId: getByTaskId,
        getByProjectId: getByProjectId,
        getByDiscussionId: getByDiscussionId,
        getByTasks: getByTasks,
        create: create
    };
});
