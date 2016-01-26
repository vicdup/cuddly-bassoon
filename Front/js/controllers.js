'use strict';

/* Controllers */

var cuddlyControllers = angular.module('cuddlyControllers', []);

cuddlyControllers.controller('indexCtrl', ['$scope', 'apiTmdb', '$location',
    function($scope, apiTmdb, $location) {
        $scope.searchSerieByName = function(name) {
            $location.path('search/' + name);
        }
    }
]);

cuddlyControllers.controller('searchCtrl', ['$scope', 'apiTmdb', 'apiUserDb', '$stateParams', '$location',
    function($scope, apiTmdb, apiUserDb, $stateParams, $location) {
        apiTmdb.getSerieByName($stateParams.query).then(function(r) {
            if (r.results.length == 0) {
                $scope.filled = false;
            }
            if (r.results.length == 1) {
                var idSerie = r.results[0].id;
                $location.path('serie/' + idSerie);
            } else {
                $scope.empty = false;
                $scope.series = r.results;
                $scope.userFollowedSeries = apiUserDb.getFollowedSeriesIds();
            }
        })
    }
]);

cuddlyControllers.controller('seriePageCtrl', ['$scope', 'apiTmdb', 'apiUserDb','$stateParams',
    function($scope, apiTmdb, apiUserDb, $stateParams) {
        var getMaxSeason = function(serie) {
            var seasons = serie.seasons;
            var maxseason = 0;
            for (var i = 0; i < seasons.length; i++) {
                if (seasons[i].season_number > maxseason) {
                    maxseason = seasons[i].season_number;
                }
            }
            return maxseason;
        }
        $scope.addSerie = function(tmdbId) {
            var emailUser = apiUserDb.getCurrentUser().email;
            apiUserDb.postSerie(emailUser,tmdbId).then(function(r) {
            $scope.userFollowedSeries.push(tmdbId);
            })
        }
      $scope.deleteSerie = function(tmdbId) {
            var emailUser = apiUserDb.getCurrentUser().email;
            apiUserDb.deleteSerie(emailUser,tmdbId).then(function(r) {
              $scope.userFollowedSeries.splice($scope.userFollowedSeries.indexOf(tmdbId), 1);
            })
        }
        $scope.previous_season = function() {
            if ($scope.seasonNumberToShow > 1) {
                $scope.seasonNumberToShow -= 1;
                apiTmdb.getSeasonByNumberSeason($scope.seasonNumberToShow, $scope.serie.id).then(function(r) {
                    $scope.seasonToShow = r;
                })
            }
        }

        $scope.next_season = function() {
            if ($scope.seasonNumberToShow < $scope.maxseason) {
                $scope.seasonNumberToShow += 1;
                apiTmdb.getSeasonByNumberSeason($scope.seasonNumberToShow, $scope.serie.id).then(function(r) {
                    $scope.seasonToShow = r;
                })
            }
        }
        $scope.userFollowedSeries = apiUserDb.getFollowedSeriesIds();
        $scope.serieId = $stateParams.serieId;
        apiTmdb.getSerieById($scope.serieId).then(function(d) {
            $scope.serie = d;
            $scope.maxseason = getMaxSeason($scope.serie);
            $scope.currentdate = new Date();
            $scope.serieFollowed = true;


            apiTmdb.getSeasonByNumberSeason($scope.maxseason, $scope.serie.id).then(function(r) {
                $scope.season = r;
                $scope.seasonToShow = r;
                $scope.seasonNumberToShow = $scope.seasonToShow.season_number;
                var lastepisodedate = new Date($scope.season.episodes[$scope.season.episodes.length - 1].air_date);
                if ($scope.currentdate.getTime() > lastepisodedate.getTime()) {
                    $scope.serieStatus = "Finished";
                } else {
                    $scope.serieStatus = "On going";
                }
            })
        })
    }
]);

cuddlyControllers.controller('loginCtrl', ['$scope', '$state', '$stateParams', 'apiUserDb',
    function($scope, $state, $stateParams, apiUserDb) {
        $scope.answer = "";
        $scope.doLogin = function(pseudo) {
            apiUserDb.getUserByEmail(pseudo).then(function successCallBack() {
                    console.log(apiUserDb.isAuthenticated())
                    if (apiUserDb.isAuthenticated() == true) {
                        $state.go('home');
                    } else {
                        $scope.answer = "Wrong pseudo, Try again"
                    }
                },
                function errorCallBack() {
                    $scope.answer = "Something went wrong, Try again"
                }
            )
        }
    }
]);

cuddlyControllers.controller('homeCtrl', ['$scope', 'apiUserDb', '$state', 'recommendations',
    function($scope, apiUserDb, $state, recommendations) {
        if (apiUserDb.isAuthenticated() == true) {
            $scope.user = apiUserDb.getCurrentUser();
            $scope.series = apiUserDb.getCurrentUserSeriesDetails();
        } else {
            $state.go('login');
        }
        //$scope.user.series = {0: {tmdbId: 34307}, 1: {tmdbId: 1906}};
        recommendations.updateFollowedSeries($scope.user.series, apiUserDb.isAuthenticated).then(function successCallBack(value) {
            console.log(value);
            recommendations.updateRecommendations(apiUserDb.isAuthenticated).then(function successCallBack(value) {
                $scope.recommendedSeries = recommendations.getRecommendations();
                console.log($scope.recommendedSeries);
            })
        });


    }
]);

cuddlyControllers.controller('episodePageCtrl', ['$scope', 'apiTmdb', '$stateParams',
    function($scope, apiTmdb, $stateParams) {
        var getMaxSeason = function(serie) {
            var seasons = serie.seasons;
            var maxseason = 0;
            for (var i = 0; i < seasons.length; i++) {
                if (seasons[i].season_number > maxseason) {
                    maxseason = seasons[i].season_number;
                }
            }
            return maxseason;
        }


        $scope.serieId = $stateParams.serieId;
        $scope.seasonNumber = $stateParams.seasonNumber;
        $scope.episodeNumber = $stateParams.episodeNumber;

        apiTmdb.getSerieById($scope.serieId).then(function(r) {
            $scope.serie = r;
            var maxSeasonNumber = getMaxSeason(r);
            console.log(maxSeasonNumber)

            apiTmdb.getSeasonByNumberSeason($scope.seasonNumber, $scope.serieId).then(function(r) {
                var maxEpisodeNumber = r.episodes.length;

                $scope.previous_episode = function() {
                    if ($scope.episodeNumber > 1) {
                        $scope.episodeNumber = parseInt($scope.episodeNumber) - 1;
                    } else {
                        if ($scope.seasonNumber > 1) {
                            $scope.seasonNumber = parseInt($scope.seasonNumber) - 1;
                            apiTmdb.getSeasonByNumberSeason($scope.seasonNumber, $scope.serieId).then(function(r) {
                                maxEpisodeNumber = r.episodes.length;
                                $scope.episodeNumber = maxEpisodeNumber;
                            })
                        }
                    }

                    apiTmdb.getEpisodeByNumberSeasonByEpisodeId($scope.seasonNumber, $scope.serieId, $scope.episodeNumber).then(function(d) {
                        $scope.episode = d;
                    });
                }
                $scope.next_episode = function() {
                    if ($scope.episodeNumber < maxEpisodeNumber) {
                        $scope.episodeNumber = parseInt($scope.episodeNumber) + 1;
                    } else { //On est au dernier episode de la saison
                        if ($scope.seasonNumber < maxSeasonNumber) {
                            $scope.seasonNumber = parseInt($scope.seasonNumber) + 1;
                            apiTmdb.getSeasonByNumberSeason($scope.seasonNumber, $scope.serieId).then(function(r) {
                                maxEpisodeNumber = r.episodes.length;
                                $scope.episodeNumber = 1;
                            })
                        }
                    }

                    apiTmdb.getEpisodeByNumberSeasonByEpisodeId($scope.seasonNumber, $scope.serieId, $scope.episodeNumber).then(function(d) {
                        $scope.episode = d;
                    });

                    apiTmdb.getSerieById($scope.serieId).then(function(r) {
                        $scope.serie = r;
                    });
                }
            })
        });



        apiTmdb.getEpisodeByNumberSeasonByEpisodeId($scope.seasonNumber, $scope.serieId, $scope.episodeNumber).then(function(d) {
            $scope.episode = d;
        });

    }
]);


cuddlyControllers.controller('followedSeriesPageCtrl', ['$scope', 'apiUserDb', 'apiTmdb', '$stateParams', '$state',
    function($scope, apiUserDb, apiTmdb, $stateParams, $state) {
        var getMaxSeason = function(serie) {
            var seasons = serie.seasons;
            var maxseason = 0;
            for (var i = 0; i < seasons.length; i++) {
                if (seasons[i].season_number > maxseason) {
                    maxseason = seasons[i].season_number;
                }
            }
            return maxseason;
        }

        if (apiUserDb.isAuthenticated() == true) {
            $scope.emailUser = apiUserDb.getCurrentUser().email;
        } else {
            $state.go('login');
        }
        apiUserDb.getUserByEmail($scope.emailUser).then(function(r) {
            $scope.user = r;
            $scope.series = $scope.user.series.tmdbId;
            var seriesIds = [];
            for (var i = $scope.user.series.length - 1; i >= 0; i--) {
                seriesIds.push($scope.user.series[i].tmdbId);
            };

            var followed_series = [];
            var followed_series_pairs = []
            var id = 0;
            var etats_series = [];
            var maxseasons = [];
            var nextepisodes = [];
            for (id in seriesIds) {
                apiTmdb.getSerieById(seriesIds[id]).then(function(d) {
                    followed_series.push(d);
                    if ((followed_series_pairs.length == 0) || (followed_series_pairs[followed_series_pairs.length - 1].length != 1)) {
                        followed_series_pairs.push([d])
                    } else {
                        followed_series_pairs[followed_series_pairs.length - 1].push(d)
                    }
                    maxseasons[d.id] = getMaxSeason(d);
                    $scope.currentdate = new Date();
                    apiTmdb.getSeasonByNumberSeason(getMaxSeason(d), d.id).then(function(r) {
                        $scope.season = r;
                        var lastepisodedate = new Date($scope.season.episodes[$scope.season.episodes.length - 1].air_date);
                        if ($scope.currentdate.getTime() > lastepisodedate.getTime()) {
                            etats_series[d.id] = "Finished";
                            nextepisodes[d.id] = $scope.season.episodes[$scope.season.episodes.length - 1].episode_number;
                        } else {
                            etats_series[d.id] = "On going";
                            var nextepisode = $scope.season.episodes[$scope.season.episodes.length - 1];
                            for (var i = $scope.season.episodes.length - 1; i >= 0; i--) {
                                var episodeairdate = new Date($scope.season.episodes[i].air_date);
                                var nextepisodeairdate = new Date(nextepisode.air_date);
                                if (episodeairdate.getTime() < nextepisodeairdate.getTime()) {
                                    if (episodeairdate.getTime() >= $scope.currentdate.getTime()) {
                                        nextepisode = $scope.season.episodes[i];
                                    }
                                }
                            };
                            nextepisodes[d.id] = nextepisode.episode_number;
                        }
                    })
                });
            }
            console.log(followed_series_pairs)
            $scope.followed_series = followed_series;
            $scope.followed_series_pairs = followed_series_pairs;
            $scope.etats_series = etats_series;
            $scope.maxseasons = maxseasons;
            $scope.nextepisodes = nextepisodes
        });
    }
]);

cuddlyControllers.controller('calendarPageCtrl', ['$scope', 'apiUserDb', 'apiTmdb', '$stateParams', '$state',
    function($scope, apiUserDb, apiTmdb, $stateParams, $state) {
        if (apiUserDb.isAuthenticated() == true) {
            $scope.emailUser = apiUserDb.getCurrentUser().email;
        } else {
            $state.go('login');
        }
        apiUserDb.getUserByEmail($scope.emailUser).then(function(r) {
            $scope.user = r;
            $scope.series = $scope.user.series.tmdbId;
            var seriesIds = [];
            for (var i = $scope.user.series.length - 1; i >= 0; i--) {
                if (typeof($scope.user.series[i].tmdbId) == 'number') {
                    seriesIds.push($scope.user.series[i].tmdbId);
                }
            };

            var currentdate = new Date();
            $scope.currentmonth = currentdate.getMonth();
            console.log("mois courant");
            console.log($scope.currentmonth);
            console.log("année courant");
            console.log($scope.currentyear);
            $scope.currentyear = currentdate.getYear();
            var month1 = [];
            var month2 = [];
            var month3 = [];

            for (var i = seriesIds.length - 1; i >= 0; i--) {
                apiTmdb.getSerieById(seriesIds[i]).then(function(d) {
                    var serie = d;

                    for (var j = serie.seasons.length - 1; j >= 0; j--) {
                        apiTmdb.getSeasonByNumberSeason(serie.seasons[j].season_number, serie.id).then(function(t) {

                            for (var k = t.episodes.length - 1; k >= 0; k--) {

                                var episodedate = new Date(t.episodes[k].air_date);
                                console.log("date de l'épisode");
                                console.log(episodedate);
                                if ($scope.currentmonth == 1) {
                                    if ((episodedate.getYear() == $scope.currentyear && episodedate.getMonth() == $scope.currentmonth)) {
                                        month2.push([serie.id, t.season_number, t.episodes[k].air_date]);
                                    };
                                    if (episodedate.getYear() == $scope.currentyear && episodedate.getMonth() == $scope.currentmonth + 1) {
                                        month3.push([serie.id, t.season_number, t.episodes[k].air_date]);
                                    };
                                    if (episodedate.getMonth() == 12 && episodedate.getYear() == $scope.currentyear - 1) {
                                        month1.push([serie.id, t.season_number, t.episodes[k].air_date]);
                                    };
                                };
                                if ($scope.currentmonth == 12) {
                                    if ((episodedate.getYear() == $scope.currentyear && episodedate.getMonth() == $scope.currentmonth)) {
                                        month2.push([serie.id, t.season_number, t.episodes[k].air_date]);
                                    };
                                    if (episodedate.getYear() == $scope.currentyear && episodedate.getMonth() == $scope.currentmonth - 1) {
                                        month1.push([serie.id, t.season_number, t.episodes[k].air_date]);
                                    };
                                    if (episodedate.getMonth() == 1 && episodedate.getYear() == $scope.currentyear + 1) {
                                        month3.push([serie.id, t.season_number, t.episodes[k].air_date]);
                                    };
                                };
                                if (episodedate.getYear() == $scope.currentyear && episodedate.getMonth() == $scope.currentmonth - 1) {
                                    month1.push([serie.id, t.season_number, t.episodes[k].air_date]);
                                };
                                if (episodedate.getYear() == $scope.currentyear && episodedate.getMonth() <= $scope.currentmonth + 1) {
                                    month3.push([serie.id, t.season_number, t.episodes[k].air_date]);
                                };
                                if (episodedate.getYear() == $scope.currentyear && episodedate.getMonth() <= $scope.currentmonth) {
                                    month2.push([serie.id, t.season_number, t.episodes[k].air_date]);
                                };

                            };
                        })
                    };
                });
            };
            $scope.month1 = month1;
            $scope.month2 = month2;
            $scope.month3 = month3;
        });
    }
]);