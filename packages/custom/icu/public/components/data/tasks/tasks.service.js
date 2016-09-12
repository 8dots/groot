'use strict';

angular.module('mean.icu.data.tasksservice', [])
.service('TasksService', function (ApiUri, $http, PaginationService) {
    var EntityPrefix = '/tasks';
    var filterValue = false;
    var data;

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
            return PaginationService.processResponse(result.data);
        });
    }

    function getTags() {
        return $http.get(EntityPrefix + '/tags').then(function (result) {
            return result.data;
        });
    }

    function getById(id) {
        return $http.get(ApiUri + EntityPrefix + '/' + id).then(function (result) {
            return result.data;
        });
    }

    function getByEntityId(entity) {
        return function(id, start, limit, sort, starred) {
            var qs = querystring.encode({
                start: start,
                limit: limit,
                sort: sort
            });

            if (qs.length) {
                qs = '?' + qs;
            }

            var url = ApiUri + '/' + entity + '/' + id + EntityPrefix;
            if (starred) {
                url += '/starred';
            }

            return $http.get(url + qs).then(function(result) {
                return PaginationService.processResponse(result.data);
            });
        }
    }

    function search(term) {
        return $http.get(ApiUri + '/search?term=' + term + '&index=task').then(function (result) {
            return result.data.task || [];
        });
    }

    function create(task) {
        return $http.post(ApiUri + EntityPrefix, task).then(function (result) {
            return result.data;
        });
    }

    function update(task) {
        if (task.subTasks && task.subTasks.length && task.subTasks[task.subTasks.length-1] && !task.subTasks[task.subTasks.length-1]._id) {
            var subTask = task.subTasks[task.subTasks.length-1];
        }
        return $http.put(ApiUri + EntityPrefix + '/' + task._id, task).then(function (result) {
            result.data.subTasks.push(subTask);
            return result.data;
        });
    }

    function star(task) {
        return $http.patch(ApiUri + EntityPrefix + '/' + task._id + '/star', {star: !task.star})
            .then(function (result) {
                task.star = !task.star;
                return result.data;
            });
    }

    function getStarred() {
        return $http.get(ApiUri + EntityPrefix + '/starred').then(function (result) {
            return result.data;
        });
    }

    function remove(id) {
        return $http.delete(ApiUri + EntityPrefix + '/' + id).then(function (result) {
            return result.data;
        });
    }

    function getMyTasks() {
    	return $http.get(ApiUri + EntityPrefix + '/byAssign').then(function (result) {
            return result.data;
        });
    }

	function getMyTasksStatistics() {
		return $http.get(ApiUri + '/myTasksStatistics').then(function (result) {
            return result.data;
        });
    }

    function getOverdueWatchedTasks() {
    	return $http.get(ApiUri + '/overdueWatchedTasks').then(function (result) {
            return result.data;
        });
    }

    function getWatchedTasks() {
    	return $http.get(ApiUri + '/watchedTasks').then(function (result) {
            return result.data;
        });
    }

    function getStarredByassign() {
        return $http.get(ApiUri + EntityPrefix + '/starred/byAssign').then(function (result) {
            return result.data;
        });
    }

    function getSubTasks(taskId) {
    	return $http.get(ApiUri + EntityPrefix + '/subtasks/' + taskId).then(function (result) {
            return result.data;
        });
    }

    function getTemplate(taskId) {
       return $http.get(ApiUri + '/templates' ).then(function (result) {
            return result.data;
        });
    }

    function saveTemplate(id, name){
        return $http.post(ApiUri + EntityPrefix + '/' + id + '/toTemplate', name).then(function (result) {
            return result.data;
        });
    }

    function template2subTasks(templateId, data){
        return $http.post(ApiUri  + '/templates/' + templateId + '/toSubTasks', data).then(function (result) {
            return result.data;
        });
    }

    function deleteTemplate(id){
        return $http.delete(ApiUri + '/templates/' + id).then(function (result) {
            return result.data;
        });
    }

    return {
        getAll: getAll,
        getTags: getTags,
        getById: getById,
        getByUserId: getByEntityId('users'),
        getByProjectId: getByEntityId('projects'),
        getByDiscussionId: getByEntityId('discussions'),
        search: search,
        create: create,
        update: update,
        remove: remove,
        getStarred: getStarred,
        star: star,
        getMyTasks: getMyTasks,
        getMyTasksStatistics: getMyTasksStatistics,
        getOverdueWatchedTasks: getOverdueWatchedTasks,
        getWatchedTasks: getWatchedTasks,
        getStarredByassign: getStarredByassign,
        getSubTasks: getSubTasks,
        getTemplate: getTemplate,
        filterValue: filterValue,
        saveTemplate: saveTemplate,
        template2subTasks:template2subTasks,
        deleteTemplate: deleteTemplate,
        data: data
    };
});
