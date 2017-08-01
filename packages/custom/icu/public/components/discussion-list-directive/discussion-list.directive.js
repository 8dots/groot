'use strict';

angular.module('mean.icu.ui.discussionlistdirective', [])
.directive('icuDiscussionList', function ($state, $uiViewScroll, $stateParams, $timeout, context ) {
    var creatingStatuses = {
        NotCreated: 0,
        Creating: 1,
        Created: 2
    };

    function controller($scope, DiscussionsService) {
        $scope.context = context;
        $scope.loading = true;

        _($scope.discussions).each(function(d) {
            d.__state = creatingStatuses.Created;

            if (d.title.length > 20)
            {
                d.PartTitle = d.title.substring(0,20) + "...";
            }
            else
            {
                d.PartTitle = d.title;
            }
            d.IsTitle = false;
        });

        var newDiscussion = {
            title: '',
            watchers: [],
            tags: [],
            __state: creatingStatuses.NotCreated,
            __autocomplete: false
        };

        $scope.discussions.push(_(newDiscussion).clone());

        $scope.detailsState = context.entityName === 'all' ? 'main.discussions.all.details' : 'main.discussions.byentity.details';

        $scope.showDetails = function (discussion) {
            if (context.entityName === 'all') {
                $state.go($scope.detailsState, {
                    id: discussion._id
                });
            } else {
                $state.go($scope.detailsState, {
                    id: discussion._id,
                    entity: context.entityName,
                    entityId: context.entityId
                });
            }
        };

        $scope.createOrUpdate = function(discussion) {
            if (discussion.__state === creatingStatuses.NotCreated) {
                discussion.__state = creatingStatuses.Creating;

                return DiscussionsService.create(discussion).then(function(result) {
                    discussion.__state = creatingStatuses.Created;

                    if (context.entityName !== 'all') {
                        discussion[context.entityName] = context.entity;
                    }

                    $scope.discussions.push(_(newDiscussion).clone());

                    DiscussionsService.data.push(discussion);

                    return discussion;
                });
            } else if (discussion.__state === creatingStatuses.Created) {
                
                if (!discussion.IsTitle)
                {
                    discussion.PartTitle = discussion.PartTitle.split("...")[0] + discussion.title.substring(discussion.PartTitle.split("...")[0].length,discussion.title.length);
                    discussion.IsTitle = !discussion.IsTitle;
                }
                discussion.title = discussion.PartTitle;

                return DiscussionsService.update(discussion);
            }
        };

        $scope.debouncedUpdate = _.debounce($scope.createOrUpdate, 300);

        $scope.searchResults = [];

            $scope.search = function(discussion) {
            if (context.entityName !== 'discussion') {
                return;
            }

            if (!task.__autocomplete) {
                return;
            }

            var term = discussion.title;
            if (!term) {
                return;
            }

            $scope.searchResults.length = 0;
            $scope.selectedSuggestion = 0;
            DiscussionsService.search(term).then(function(searchResults) {
                _(searchResults).each(function(sr) {
                    var alreadyAdded = _($scope.discussions).any(function(d) {
                        return d._id === sr._id;
                    });

                    if (!alreadyAdded) {
                        $scope.searchResults.push(sr);
                    }
                });
                $scope.selectedSuggestion = 0;
            });
        };

        $scope.select = function(selectedDiscussion) {
            var currentDiscussion = _($scope.discussions).findIndex(function(d) {
                return d.id === $state.params.id;
            });

            $scope.createOrUpdate($scope.discussions[currentDiscussion + 1]).then(function(discussion) {
                $state.go($scope.detailsState, {
                    id: discussion._id,
                    entity: context.entityName,
                    entityId: context.entityId
                });
            });
        };
    }

    function link($scope, $element) {
        var isScrolled = false;

        $scope.initialize = function($event, discussion) {
            if ($scope.displayOnly) {
                return;
            }

            var nameFocused = angular.element($event.target).hasClass('name');

            discussion.PartTitle = discussion.title;

            if (discussion.__state === creatingStatuses.NotCreated) {

                $scope.createOrUpdate(discussion).then(function() {
                    $state.go($scope.detailsState, {
                        id: discussion._id,
                        entity: context.entityName,
                        entityId: context.entityId,
                        nameFocused: nameFocused
                    });
                });
            } else {
                $state.go($scope.detailsState+'.activities', {
                    id: discussion._id,
                    entity: context.entityName,
                    entityId: context.entityId,
                    nameFocused: nameFocused
                });
            }
        };

        $scope.isCurrentState = function (id) {
            var isActive = ($state.current.name.indexOf('main.discussions.byentity.details') === 0 ||
                            $state.current.name.indexOf('main.discussions.all.details') === 0
                       ) && $state.params.id === id;

            if (isActive && !isScrolled) {
                $uiViewScroll($element.find('[data-id="' + $stateParams.id + '"]'));
                isScrolled = true;
            }

            return isActive;
        };

        $scope.onEnter = function($event, index) {
            if ($event.keyCode === 13 || $event.keyCode === 9) {
                $event.preventDefault();

                $scope.discussions[index].__autocomplete = false;

                if ($element.find('td.name')[index+1]) {
                    $element.find('td.name')[index+1].focus();
                }
                else {
                	$timeout(function() {
			            $element.find('td.name')[index+1].focus();
			        }, 500);
                }
            }
        };

        $scope.focusAutoComplete = function($event) {
            angular.element($event.target).css('box-shadow', 'none')
            if ($event.keyCode === 38) {
                if ($scope.selectedSuggestion > 0) {
                    $scope.selectedSuggestion -= 1;
                }
                $event.preventDefault();
            } else if ($event.keyCode === 40) {
                if ($scope.selectedSuggestion < $scope.searchResults.length - 1) {
                    $scope.selectedSuggestion += 1;
                }
                $event.preventDefault();
            } else if ($event.keyCode === 13 || $event.keyCode === 9) {
                var sr = $scope.searchResults[$scope.selectedSuggestion];
                $scope.select(sr);
            }
        };


        $scope.hideAutoComplete = function(task) {

            if (task.title.length > 20)
            {
                task.PartTitle = task.title.substring(0,20) + "...";
            }


            task.__autocomplete = false;
            $scope.searchResults.length = 0;
            $scope.selectedSuggestion = 0;
        };

        // infinite scroll
        $timeout(function() {
            $scope.displayLimit = Math.ceil($element.height() / 50);
            $scope.isLoading = false;
        }, 0);

        $scope.loadMore = function() {
            if (!$scope.isLoading && $scope.loadNext) {
                $scope.isLoading = true;
                $scope.loadNext().then(function(discussions) {

                    _(discussions.data).each(function(d) {
                        d.__state = creatingStatuses.Created;
                        d.PartTitle = d.title;
                        if (d.title.length > 20)
                        {
                            d.PartTitle = d.title.substring(0,20) + "...";
                        }
                        else
                        {
                            d.PartTitle = d.title;
                        }
                        d.IsTitle = false;
                    });

                    var offset = $scope.displayOnly ? 0 : 1;

                    if (discussions.data.length) {
                        var index = $scope.discussions.length - offset;
                        var args = [index, 0].concat(discussions.data);

                        [].splice.apply($scope.discussions, args);
                    }

                    $scope.loadNext = discussions.next;
                    $scope.loadPrev = discussions.prev;
                    $scope.isLoading = false;
                });
            }
        };
    }

    return {
        restrict: 'A',
        templateUrl: '/icu/components/discussion-list-directive/discussion-list.directive.template.html',
        scope: {
            loadNext: '=',
            loadPrev: '=',
            discussions: '=',
            drawArrow: '=',
            groupDiscussions: '=',
            order: '='
        },
        link: link,
        controller: controller
    };
});
