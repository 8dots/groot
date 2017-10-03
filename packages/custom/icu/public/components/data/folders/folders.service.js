'use strict';

angular.module('mean.icu.data.foldersservice', [])
.service('FoldersService', function(ApiUri, $http, PaginationService, TasksService, $rootScope, WarningsService, ActivitiesService) {
    var EntityPrefix = '/folders';
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
            var data = some.content ? some : [];
            return PaginationService.processResponse(data);
        });
    }

    function getById(id) {
        return $http.get(ApiUri + EntityPrefix + '/' + id).then(function(result) {
        	WarningsService.setWarning(result.headers().warning);
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
            	WarningsService.setWarning(result.headers().warning);
                return PaginationService.processResponse(result.data);
            });
        }
    }

    function create(folder) {
        return $http.post(ApiUri + EntityPrefix, folder).then(function(result) {

        	WarningsService.setWarning(result.headers().warning);
            return result.data;
        });
    }


    function update(folder, context) {
        context = context || {};
        if (!context.action) {
            context.action = 'updated';
        }
        if (!context.type) {
            context.type = 'folder';
        }

        return $http.put(ApiUri + EntityPrefix + '/' + folder._id, folder).then(function(result) {
        	WarningsService.setWarning(result.headers().warning);
            if(TasksService.data) {
                TasksService.data.forEach(function(task) {
                    if (task.folder && task.folder._id === folder._id) {
                        task.folder = result.data;
                    }
                });
            }
            if(TasksService.tabData) {
                TasksService.tabData.forEach(function(task) {
                    if (task.folder && task.folder._id === folder._id) {
                        task.folder = result.data;
                    }
                });
            }
            return result.data;
        });
    }

    function remove(id) {
        return $http.delete(ApiUri + EntityPrefix + '/' + id).then(function(result) {
        	WarningsService.setWarning(result.headers().warning);
            return result.data;
        });
    }

    function star(folder) {
        return $http.patch(ApiUri + EntityPrefix + '/' + folder._id + '/star', {star: !folder.star})
            .then(function (result) {
            	WarningsService.setWarning(result.headers().warning);
                folder.star = !folder.star;
                return result.data;
            });
    }

    function WantToCreateRoom(folder) {
        return $http.post(ApiUri + EntityPrefix + '/' + folder._id + '/WantToCreateRoom', folder)
            .then(function (result) {
            	WarningsService.setWarning(result.headers().warning);
                folder.WantToCreateRoom = !folder.WantToCreateRoom;
                return result.data;
            });
    }

    function getStarred() {
        return $http.get(ApiUri + EntityPrefix + '/starred').then(function (result) {
        	WarningsService.setWarning(result.headers().warning);
            return result.data;
        });
    }

    function updateWatcher(folder, me, watcher, type) {
        return ActivitiesService.create({
            data: {
                issue: 'folder',
                issueId: folder.id,
                type: type || 'updateWatcher',
                userObj: watcher                
            },
            context: {}
        }).then(function(result) {
            return result;
        });
    }

    function updateStatus(folder) {
        return ActivitiesService.create({
            data: {
                issue: 'folder',
                issueId: folder.id,
                type: 'updateStatus',
                status: folder.status
            },
            context: {}
        }).then(function(result) {
            return result;
        });
    }


    function updateColor(folder, me) {
        return ActivitiesService.create({
            data: {
                issue: 'folder',
                issueId: folder.id,
                type: 'updateColor',
                status: folder.color
            },
            context: {}
        }).then(function(result) {
            return result;
        });
    }

    return {
        getAll: getAll,
        getById: getById,
        getByDiscussionId: getByEntityId('discussions'),
        getByUserId: getByEntityId('users'),
        getByOfficeId: getByEntityId('offices'),
        getByFolderId: getByEntityId('folders'),
        create: create,
        update: update,
        remove: remove,
        star: star,
        getStarred: getStarred,
        data: data,
        selected: selected,
        WantToCreateRoom: WantToCreateRoom,
        updateWatcher: updateWatcher,
        updateStatus: updateStatus,
        updateColor: updateColor
    };
});
