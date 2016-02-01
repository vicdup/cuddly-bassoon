'use strict';

/* Controllers */

var cuddlyControllers = angular.module('cuddlyControllers', ['ngCookies']);

cuddlyControllers.controller('indexCtrl', ['$scope', 'apiTmdb', '$location', 'apiUserDb', '$state', '$cookies',
    function($scope, apiTmdb, $location, apiUserDb, $state, $cookies) {

        $scope.searchSerieByName = function(name) {
            $location.path('search/' + name);
        }
        $scope.disconnect = function() {
            console.log("disconnecting");
            apiUserDb.disconnect();
            sessionStorage.user = "";
            sessionStorage.connected = "";
            delete $scope.user;
            $state.go('login');
            console.log("User correctly disconnected")
        }
        
        $scope.isConnected =function(){
            return Boolean(sessionStorage.connected);
        }
        if (Boolean(sessionStorage.connected)) {
            $scope.user = apiUserDb.getCurrentUser();
        }
        
    }
]);

cuddlyControllers.controller('searchCtrl', ['$scope', 'apiTmdb', 'apiUserDb', '$stateParams', '$location', '$state',
    function($scope, apiTmdb, apiUserDb, $stateParams, $location, $state) {
      // $scope.isConnected() = Boolean(sessionStorage.connected);
        if (Boolean(sessionStorage.connected)) {
            $scope.user = apiUserDb.getCurrentUser();
            $scope.query=$stateParams.query;
            apiTmdb.getSerieByName($stateParams.query).then(function(r) {
                if (r.results.length == 0) {
                    $scope.empty = true;
                    console.log($scope.empty);
                }
                else if (r.results.length == 1) {
                    var idSerie = r.results[0].id;
                    $location.path('serie/' + idSerie);
                } else {
                        $scope.empty= false;
                    console.log($scope.empty)
                    $scope.series = r.results;
                    $scope.userFollowedSeries = apiUserDb.getFollowedSeriesIds();
                }
            })

        } else 
        {
            $state.go('login');
        }


    }
]);

cuddlyControllers.controller('signupPageCtrl', ['$scope', 'apiTmdb', 'apiUserDb', '$stateParams', '$location', '$state', '$cookies',
    function($scope, apiTmdb, apiUserDb, $stateParams, $location, $state, $cookies) {
        if (Boolean(sessionStorage.connected)) {
            apiUserDb.disconnect();
        }
        $scope.avatarNumber = 0;
        
        $scope.nextAvatar = function(){
            if ($scope.avatarNumber==14){
                $scope.avatarNumber=0;
            }
            else {
                $scope.avatarNumber +=1;
            }
        }
        
        $scope.previousAvatar = function(){
            if ($scope.avatarNumber==0){
                $scope.avatarNumber=14;
            }
            else {
                $scope.avatarNumber += -1;
            }
        }
        
        
        $scope.postUser = function(email,name) {
                apiUserDb.postUser(email,name, $scope.avatarNumber).then(function successCallBack(r) {
                    console.log("user created "+ $scope.avatarNumber)
                    sessionStorage.user = JSON.stringify(r);
                    sessionStorage.connected = true;
                    // $scope.isConnected = true;
                    $state.go('home');

                },
                function errorCallBack(r){
                    $scope.message = "Something went wrong, your email may be already used";
                    console.log(r.data);
                })
            };
    }
]);

cuddlyControllers.controller('seriePageCtrl', ['$scope', 'apiTmdb', 'apiUserDb', '$stateParams', '$cookies', '$state',

    function($scope, apiTmdb, apiUserDb, $stateParams, $cookies, $state) {
      // $scope.isConnected = Boolean(sessionStorage.connected);
      // console.log(apiUserDb.loginCookies());
      // apiUserDb.loginCookies().then(function(r){
        if (Boolean(sessionStorage.connected)) {
            $scope.user = apiUserDb.getCurrentUser();
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
                var user = apiUserDb.getCurrentUser();
                var emailUser = user.email;
                apiUserDb.postSerie(emailUser, tmdbId).then(function(r) {
                    $scope.userFollowedSeries.push(tmdbId);
                    var content = {"tmdbId":tmdbId};
                    user.series.push(content);
                    apiUserDb.updateCurrentUser(user);
                })
            }
            $scope.deleteSerie = function(tmdbId) {
                var user = apiUserDb.getCurrentUser();
                var emailUser = user.email;
                apiUserDb.deleteSerie(emailUser, tmdbId).then(function(r) {
                    console.log(user.series);
                    $scope.userFollowedSeries.splice($scope.userFollowedSeries.indexOf(tmdbId), 1);
                    apiUserDb.getUserByEmail(emailUser).then(function(r) {
                        apiUserDb.updateCurrentUser(r);
                    });
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


        } else {
            $state.go('login');
        }
    }
]);

cuddlyControllers.controller('loginCtrl', ['$scope', '$state', 'apiUserDb', '$stateParams', '$cookies', '$location','$window', 
    function($scope, $state, apiUserDb, $stateParams, $cookies, $location, $window) {
      // $scope.isConnected = Boolean(sessionStorage.connected);
        $scope.answer = "";
        $scope.doLogin = function(pseudo) {
            apiUserDb.getUserByEmail(pseudo).then(function successCallBack(r) {
                    if (apiUserDb.isAuthenticated() == true) {
                        apiUserDb.updateCurrentUser(r);
                        sessionStorage.connected = true;
                        $scope.user=apiUserDb.getCurrentUser();
                        $location.url('home');
                        $window.location.reload();
                        // $location.path('/home')


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

cuddlyControllers.controller('homeCtrl', ['$scope', 'apiUserDb', 'apiTmdb', '$cookies', '$state', 'recommendations',
    function($scope, apiUserDb, apiTmdb, $cookies, $state, recommendations) {
        if (Boolean(sessionStorage.connected)) {
            $scope.user = apiUserDb.getCurrentUser();
            $scope.emailUser = $scope.user.email;
            $scope.series = $scope.user.series.tmdbId;
            $scope.followed_series = apiUserDb.getCurrentUserSeriesDetails();

            var seriesIds = apiUserDb.getFollowedSeriesIds();

            var currentdate = new Date().getTime()
            $scope.latest_episodes = []
            for (var i = seriesIds.length - 1; i >= 0; i--) {
                apiTmdb.getSerieById(seriesIds[i]).then(function(d) {
                    var serie = d;
                    var serieName = d.name;
                    for (var j = serie.seasons.length - 1; j >= 0; j--) {
                        apiTmdb.getSeasonByNumberSeason(serie.seasons[j].season_number, serie.id).then(function(t) {
                            for (var k = t.episodes.length - 1; k >= 0; k--) {
                                if (t.episodes[k].air_date) {
                                    var timestamp = new Date(t.episodes[k].air_date).getTime()
                                    if (timestamp < currentdate) {
                                        $scope.latest_episodes.push({ts: timestamp, serieName : serie.name, seriePoster: serie.poster_path, seasonNumber : t.season_number, episodeNumber : t.episodes[k].episode_number, episodeName : t.episodes[k].name, serieId : serie.id})
                                    };
                                }
                            };
                        })
                    };
                });
            };            
            recommendations.updateFollowedSeries($scope.user.series, apiUserDb.isAuthenticated).then(function successCallBack(value) {
                recommendations.updateRecommendations(apiUserDb.isAuthenticated).then(function successCallBack(value) {
                    $scope.recommendedSeries = recommendations.getRecommendations();
                })
            });

        } else {
            $state.go('login');
        }
        //$scope.user.series = {0: {tmdbId: 34307}, 1: {tmdbId: 1906}};


    }
]);

cuddlyControllers.controller('episodePageCtrl', ['$scope', 'apiTmdb', '$stateParams','$state', 'apiUserDb',
    function($scope, apiTmdb, $stateParams, $state, apiUserDb) {
      // $scope.isConnected = Boolean(sessionStorage.connected);
        if (Boolean(sessionStorage.connected)) {
            $scope.user = apiUserDb.getCurrentUser();
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

            apiTmdb.getSeasonByNumberSeason($scope.seasonNumber, $scope.serieId).then(function(r) {
                var maxEpisodeNumber = r.episodes.length;

                $scope.previous_episode = function() {
                    if ($scope.episodeNumber > 1) {
                        $scope.episodeNumber = parseInt($scope.episodeNumber) - 1;
                        apiTmdb.getEpisodeByNumberSeasonByEpisodeId($scope.seasonNumber, $scope.serieId, $scope.episodeNumber).then(function(d) {
                            $scope.episode = d;
                            $state.go('episode',{"serieId":$scope.serieId,"seasonNumber":$scope.seasonNumber,"episodeNumber":$scope.episodeNumber});
                        });
                    } else {
                        if ($scope.seasonNumber > 1) {
                            $scope.seasonNumber = parseInt($scope.seasonNumber) - 1;
                            apiTmdb.getSeasonByNumberSeason($scope.seasonNumber, $scope.serieId).then(function(r) {
                                maxEpisodeNumber = r.episodes.length;
                                $scope.episodeNumber = maxEpisodeNumber;
                                apiTmdb.getEpisodeByNumberSeasonByEpisodeId($scope.seasonNumber, $scope.serieId, $scope.episodeNumber).then(function(d) {
                                    $scope.episode = d;
                                    $state.go('episode',{"serieId":$scope.serieId,"seasonNumber":$scope.seasonNumber,"episodeNumber":$scope.episodeNumber});
                                });
                            })
                        }
                    }

                    
                    apiTmdb.getSerieById($scope.serieId).then(function(r) {
                        $scope.serie = r;
                    });
                }
                $scope.next_episode = function() {
                    if ($scope.episodeNumber < maxEpisodeNumber) {
                        $scope.episodeNumber = parseInt($scope.episodeNumber) + 1;
                        apiTmdb.getEpisodeByNumberSeasonByEpisodeId($scope.seasonNumber, $scope.serieId, $scope.episodeNumber).then(function(d) {
                            $scope.episode = d;
                            $state.go('episode',{"serieId":$scope.serieId,"seasonNumber":$scope.seasonNumber,"episodeNumber":$scope.episodeNumber});
                        });
                    } else { //On est au dernier episode de la saison
                        if ($scope.seasonNumber < maxSeasonNumber) { //Si on n'est pas à la dernière saison
                            $scope.seasonNumber = parseInt($scope.seasonNumber) + 1;
                            apiTmdb.getSeasonByNumberSeason($scope.seasonNumber, $scope.serieId).then(function(r) {
                                maxEpisodeNumber = r.episodes.length;
                                $scope.episodeNumber = 1;
                                apiTmdb.getEpisodeByNumberSeasonByEpisodeId($scope.seasonNumber, $scope.serieId, $scope.episodeNumber).then(function(d) {
                                    $scope.episode = d;
                                    $state.go('episode',{"serieId":$scope.serieId,"seasonNumber":$scope.seasonNumber,"episodeNumber":$scope.episodeNumber});
                                });
                            })
                        }
                    }

                }
            })
        });
        apiTmdb.getEpisodeByNumberSeasonByEpisodeId($scope.seasonNumber, $scope.serieId, $scope.episodeNumber).then(function(d) {
            $scope.episode = d;
        });
        } else {
            $state.go('login');
        }
    }
]);


cuddlyControllers.controller('followedSeriesPageCtrl', ['$scope', 'apiUserDb', 'apiTmdb', '$stateParams', '$cookies', '$state',
    function($scope, apiUserDb, apiTmdb, $stateParams, $cookies, $state) {
      // $scope.isConnected = Boolean(sessionStorage.connected);
      if (Boolean(sessionStorage.connected)) {
            $scope.user = apiUserDb.getCurrentUser();
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

            $scope.emailUser = $scope.user.email;

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

            $scope.followed_series = followed_series;
            $scope.followed_series_pairs = followed_series_pairs;
            $scope.etats_series = etats_series;
            $scope.maxseasons = maxseasons;
            $scope.nextepisodes = nextepisodes
        });
        } else {
            $state.go('login');
        }
    }

]);

cuddlyControllers.controller('calendarPageCtrl', ['$scope', 'apiUserDb', 'apiTmdb', '$stateParams', '$state', '$cookies',
    function($scope, apiUserDb, apiTmdb, $stateParams, $state, $cookies){
        if (Boolean(sessionStorage.connected)){
            $scope.user = apiUserDb.getCurrentUser();

            $scope.emailUser = $scope.user.email;
            $scope.series = $scope.user.series.tmdbId;
            var seriesIds = apiUserDb.getFollowedSeriesIds();

            var currentdate = new Date();
            $scope.currentmonth = currentdate.getMonth()+1;
            $scope.currentyear = currentdate.getFullYear();
            var month1 = [];
            var month2 = [];
            var month3 = [];

            for (var i = seriesIds.length - 1; i >= 0; i--) {
                apiTmdb.getSerieById(seriesIds[i]).then(function(d) {
                    var serie = d;
                    var serieName = d.name;
                    for (var j = serie.seasons.length - 1; j >= 0; j--) {
                        apiTmdb.getSeasonByNumberSeason(serie.seasons[j].season_number, serie.id).then(function(t) {
                            console.log("t.episodes");
                            console.log(t.episodes);
                            for (var k = t.episodes.length - 1; k >= 0; k--) {
                                var episodedate = new Date(t.episodes[k].air_date);
                                if (episodedate.getTime() < currentdate.getTime()){
                                    var styleEpisode = "passed";
                                }
                                else{
                                    var styleEpisode = "upcoming";
                                };
                                if (k == 0){
                                    var styleEpisode = "first_episode";
                                }
                                else if (k == t.episodes.length - 1){
                                    var styleEpisode = "last_episode";
                                }
                                if ($scope.currentmonth == 1) {
                                    if (episodedate.getMonth() + 1 == 12 && episodedate.getFullYear() == $scope.currentyear - 1) {
                                        month1.push({episodeDate: episodedate.getDate(), serieName : serie.name, seasonNumber : t.season_number, episodeNumber : t.episodes[k].episode_number, episodeName : t.episodes[k].name, serieId : serie.id, styleCSS : styleEpisode});
                                    };
                                    if ((episodedate.getFullYear() == $scope.currentyear && episodedate.getMonth() + 1 == $scope.currentmonth)) {
                                        month2.push({episodeDate: episodedate.getDate(), serieName : serie.name, seasonNumber : t.season_number, episodeNumber : t.episodes[k].episode_number, episodeName : t.episodes[k].name, serieId : serie.id, styleCSS : styleEpisode});
                                    };
                                    if (episodedate.getFullYear() == $scope.currentyear && episodedate.getMonth() + 1 == $scope.currentmonth + 1) {
                                        month3.push({episodeDate: episodedate.getDate(), serieName : serie.name, seasonNumber : t.season_number, episodeNumber : t.episodes[k].episode_number, episodeName : t.episodes[k].name, serieId : serie.id, styleCSS : styleEpisode});
                                    };
                                } else if ($scope.currentmonth == 12) {
                                    if (episodedate.getFullYear() == $scope.currentyear && episodedate.getMonth() + 1 == $scope.currentmonth - 1) {
                                        month1.push({episodeDate: episodedate.getDate(), serieName : serie.name, seasonNumber : t.season_number, episodeNumber : t.episodes[k].episode_number, episodeName : t.episodes[k].name, serieId : serie.id, styleCSS : styleEpisode});
                                    };
                                    if ((episodedate.getFullYear() == $scope.currentyear && episodedate.getMonth() + 1 == $scope.currentmonth)) {
                                        month2.push({episodeDate: episodedate.getDate(), serieName : serie.name, seasonNumber : t.season_number, episodeNumber : t.episodes[k].episode_number, episodeName : t.episodes[k].name, serieId : serie.id, styleCSS : styleEpisode});
                                    };
                                    if (episodedate.getMonth() + 1 == 1 && episodedate.getFullYear() == $scope.currentyear + 1) {
                                        month3.push({episodeDate: episodedate.getDate(), serieName : serie.name, seasonNumber : t.season_number, episodeNumber : t.episodes[k].episode_number, episodeName : t.episodes[k].name, serieId : serie.id, styleCSS : styleEpisode});
                                    };
                                } else {
                                    if (episodedate.getFullYear() == $scope.currentyear && episodedate.getMonth() + 1 == $scope.currentmonth - 1) {
                                        month1.push({episodeDate: episodedate.getDate(), serieName : serie.name, seasonNumber : t.season_number, episodeNumber : t.episodes[k].episode_number, episodeName : t.episodes[k].name, serieId : serie.id, styleCSS : styleEpisode});
                                    };
                                    if (episodedate.getFullYear() == $scope.currentyear && episodedate.getMonth() + 1 == $scope.currentmonth) {
                                        month2.push({episodeDate: episodedate.getDate(), serieName : serie.name, seasonNumber : t.season_number, episodeNumber : t.episodes[k].episode_number, episodeName : t.episodes[k].name, serieId : serie.id, styleCSS : styleEpisode});
                                    };
                                    if (episodedate.getFullYear() == $scope.currentyear && episodedate.getMonth() + 1 == $scope.currentmonth + 1) {
                                        month3.push({episodeDate: episodedate.getDate(), serieName : serie.name, seasonNumber : t.season_number, episodeNumber : t.episodes[k].episode_number, episodeName : t.episodes[k].name, serieId : serie.id, styleCSS : styleEpisode});
                                    };
                                };
                            };
                        })
                    };
                })
            };
            var monthsNames = [];
            if ($scope.currentmonth == 1){
                monthsNames.push("Décembre");
                monthsNames.push("Janvier");
                monthsNames.push("Février");
            }
            if ($scope.currentmonth == 2){
                monthsNames.push("Janvier");
                monthsNames.push("Février");
                monthsNames.push("Mars");
            }
            if ($scope.currentmonth == 3){
                monthsNames.push("Février");
                monthsNames.push("Mars");
                monthsNames.push("Avril");
            }
            if ($scope.currentmonth == 4){
                monthsNames.push("Mars");
                monthsNames.push("Avril");
                monthsNames.push("Mai");
            }
            if ($scope.currentmonth == 5){
                monthsNames.push("Avril");
                monthsNames.push("Mai");
                monthsNames.push("Juin");
            }
            if ($scope.currentmonth == 6){
                monthsNames.push("Mai");
                monthsNames.push("Juin");
                monthsNames.push("Juillet");
            }
            if ($scope.currentmonth == 7){
                monthsNames.push("Juin");
                monthsNames.push("Juillet");
                monthsNames.push("Aout");
            }
            if ($scope.currentmonth == 8){
                monthsNames.push("Juillet");
                monthsNames.push("Aout");
                monthsNames.push("Septembre");
            }
            if ($scope.currentmonth == 9){
                monthsNames.push("Aout");
                monthsNames.push("Septembre");
                monthsNames.push("Octobre");
            }
            if ($scope.currentmonth == 10){
                monthsNames.push("Septembre");
                monthsNames.push("Octobre");
                monthsNames.push("Novembre");
            }
            if ($scope.currentmonth == 11){
                monthsNames.push("Octobre");
                monthsNames.push("Novembre");
                monthsNames.push("Décembre");
            }
            if ($scope.currentmonth == 12){
                monthsNames.push("Novembre");
                monthsNames.push("Décembre");
                monthsNames.push("Janvier");
            }
            $scope.month1 = month1;
            $scope.month2 = month2;
            $scope.month3 = month3;
            $scope.monthsNames = monthsNames;
        }
        else {
            $state.go('login');
        }
    }
]);