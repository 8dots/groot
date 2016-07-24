'use strict';

angular.module('mean.icu.data.documentsservice', [])
    .service('DocumentsService', function ($http, ApiUri, Upload) {
        var EntityPrefix = '/attachments';

        function getAll() {
            return $http.get(ApiUri + EntityPrefix).then(function (result) {
                return result.data;
            });
        }

        function getById(id) {
            return $http.get(ApiUri + EntityPrefix + '/' + id).then(function (result) {
                return result.data;
            });
        }

        function getByTaskId(id) {
            return $http.get(ApiUri + '/tasks/' + id + EntityPrefix).then(function (result) {
                return result.data;
            });
        }

        function getByProjectId(id) {
            return $http.get(ApiUri + '/projects/' + id + EntityPrefix).then(function (result) {
                return result.data;
            });
        }

        function getByDiscussionId(id) {
            return $http.get(ApiUri + '/discussions/' + id + EntityPrefix).then(function (result) {
                return result.data;
            });
        }

        function getByUserId(id) {
            return $http.get(ApiUri + '/users/' + id + EntityPrefix).then(function (result) {
                return result.data;
            });
        }

        function saveAttachments(data, file) {
            return Upload.upload({
                url: '/api/attachments',
                fields: data,
                file: file
            });
        }

        function updateAttachment(id, data) {
            return $http.post(ApiUri + EntityPrefix + id, data).then(function (result) {
                return result.data;
            });
        }

        function getByTasks() {
	        return $http.get(ApiUri + '/tasks/myTasks'  + EntityPrefix).then(function(result) {
	            return result.data;
	        });
	    }

        return {
            getAll: getAll,
            getById: getById,
            getByTaskId: getByTaskId,
            getByProjectId: getByProjectId,
            getByDiscussionId: getByDiscussionId,
            getByUserId: getByUserId,
            saveAttachments: saveAttachments,
            updateAttachment: updateAttachment,
            getByTasks: getByTasks
        };
    });
