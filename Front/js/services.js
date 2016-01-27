'use strict';

/* Services */

var cuddlyServices = angular.module('cuddlyServices', ['ngResource', 'ngCookies']);
var addressIp = 'http://188.166.78.202:3000';

cuddlyServices.service('apiTmdb', function($http) {
    var apiTmdb = {
        getSerieById: function(idSerie) {
            var promise = $http.get('https://api.themoviedb.org/3/tv/' + idSerie + '?api_key=1a3f1b0a8620851f42d4b1a95494d44d').then(function(response) {
                // console.log(response);
                return response.data;
            })
            return promise;
        },
        getSeasonByNumberSeason: function(idSeason, idSerie) {
            var promise = $http.get('https://api.themoviedb.org/3/tv/' + idSerie + '/season/' + idSeason + '?api_key=1a3f1b0a8620851f42d4b1a95494d44d').then(function(response) {
                // console.log(response);
                return response.data;
            })
            return promise;
        },

        getEpisodeByNumberSeasonByEpisodeId: function(seasonNumber, idSerie, episodeNumber) {
            var promise = $http.get('https://api.themoviedb.org/3/tv/' + idSerie + '/season/' + seasonNumber + '/episode/' + episodeNumber + '?api_key=1a3f1b0a8620851f42d4b1a95494d44d').then(function(response) {
                // console.log(response);
                return response.data
            })
            return promise
        },

        getSerieByName: function(name) {
            console.log(encodeURIComponent(name));
            var promise = $http.get('https://api.themoviedb.org/3/search/tv?api_key=1a3f1b0a8620851f42d4b1a95494d44d&query=' + encodeURIComponent(name)).then(function(response) {
                // console.log(response);
                return response.data;
            })
            return promise
        },

        getArrayStar: function(rate) {
            // console.log(rate);
                return new Array(Math.floor(rate/2)); 
            },

        getArrayHalfStar: function(rate) {
                if (Math.floor(rate/2)-Math.round(rate/2)==0){
                    return false;
                }
                else{
                    return true;
                }
            },

        getArrayEmptyStar: function(rate) {
                return new Array(5 - Math.round(rate/2)); 
            }


    };
    return apiTmdb;

});


cuddlyServices.service('apiUserDb', function($http, apiTmdb, $cookies) {
    var user = {};
    var authenticated = false;
    var apiUserDb = {
        getFollowedSeriesIds: function() {
            var user = JSON.parse(sessionStorage.user);
            var followedSeriesIds = [];
            var i;
            for (i in user.series) {
                if (user.series[i]['tmdbId']) {
                    followedSeriesIds.push(user.series[i]['tmdbId']);
                }
            }
            console.log(followedSeriesIds);
            return followedSeriesIds
        },
        getUserByEmail: function(emailUser) {
            console.log(emailUser);
            var promise = $http.get(addressIp + '/API/users/' + emailUser).then(function successCallback(response) {
                console.log(response);
                user = response.data;
                if (response.data == "") {
                    authenticated = false;

                } else {
                    authenticated = true;
                }
                // console.log(authenticated);
                return response.data;

            }, function errorCallback(response) {
                authenticated = false;
                // console.log("Mauvais user");
            })
            return promise;
        },
        postSerie: function(emailUser, tmdbId) {
            var content = {
                "tmdbId": tmdbId
            };
            var promise = $http.post(addressIp + '/API/users/' + emailUser + '/series', content).then(function(response) {
                return response.data;
            })
            return promise;
        },
        postUser: function(email, name, avatar) {
            var content = {
                "email": email,
                "name": name,
                "avatar": avatar,
                "series":[]
            };
            var promise = $http.post(addressIp + '/API/users/', content).then(function(response) {
                return response.data;
            })
            return promise;
        },
        deleteSerie: function(emailUser, tmdbId) {
            var content = {
                "tmdbId": tmdbId
            };
            // console.log(content);
            var promise = $http.delete(addressIp + '/API/users/' + emailUser + '/series/' + tmdbId).then(function(response) {
                return response.data;
            })
            return promise;
        },
        getCurrentUserSeriesDetails: function() {
        	user = JSON.parse(sessionStorage.user);
            var series = [];
            var i;
            for (i in user.series) {
                apiTmdb.getSerieById(user.series[i]['tmdbId']).then(function(r) {
                    series.push(r);
                });
            }
            return series
        },
        getCurrentUser: function() {
            var user=JSON.parse(sessionStorage.user);
            return user;
        },
        updateCurrentUser: function(user) {
            return sessionStorage.user = JSON.stringify(user);
        },
        isAuthenticated: function() {
            return authenticated;
        },
		disconnect: function() {
			return true;
        },
        loginCookies: function(){
            if ($cookies.get('CBemail')!='disconnected' &&  typeof($cookies.get('CBemail'))!='undefined' )
            {
                var emailUser = $cookies.get('CBemail');
                var promise = $http.get(addressIp + '/API/users/' + emailUser).then(function successCallback(response) {
                    console.log(response);
                    user = response.data;
                    sessionStorage.user = JSON.stringify(user);
                    if (response.data == "") {
                        authenticated = Boolean(false);

                    } else {
                        authenticated = Boolean(true);
                    }
                // console.log(authenticated);
                return authenticated;

            }, function errorCallback(response) {
                authenticated = false;
                // console.log("Mauvais user");
            })
            return promise;

            }
            else 
            {
                return Boolean(false);
            }
        }

    };
    return apiUserDb;

});

cuddlyServices.service('recommendations', function($http, apiUserDb, $timeout, $q) {
    // not ready yet


    var recommendedSeries = {};
    var followedSeries = {};
    var recommendationService = {};
    recommendationService.getRecommendations = function() {
        return recommendedSeries;
    };
    recommendationService.getFollowedSeries = function() {
        return followedSeries;
    };
    recommendationService.updateFollowedSeries = function(series, condition) {
        var deferred = $q.defer();
        if (condition) {
            for (var serie in series) {
                console.log(series)
                // console.log(serie)
                if (series[serie].tmdbId) {
                    followedSeries[series[serie].tmdbId] = true;
                }
            };
             console.log(followedSeries);
            deferred.resolve("Success");
        } else {
            deferred.resolve("Error");
        }
        return deferred.promise;
    };
    recommendationService.updateRecommendations = function(condition) {
        var deferred = $q.defer();
        if (condition) {
            var recommendations = {};
            var completed_request = 0;
            for (var serieId in followedSeries) {
                $http.get('https://api.themoviedb.org/3/tv/' + serieId + '/similar?api_key=1a3f1b0a8620851f42d4b1a95494d44d&page=1').then(function(response) {
                    var tempSimilars = response.data.results;
                    // console.log(tempSimilars);
                    for (var i = 0; i < response.data.results.length; i++) {
                        var currentId = tempSimilars[i].id
                        if (currentId in recommendations) {
                            recommendations[currentId].score += 1;
                        } else {
                            recommendations[currentId] = {};
                            recommendations[currentId].score = 1;
                            recommendations[currentId].popularity = tempSimilars[i].popularity;
                            recommendations[currentId].poster_path = tempSimilars[i].poster_path;
                            recommendations[currentId].id = currentId;
                        }
                    };
                    completed_request++;
                    if (completed_request == Object.keys(followedSeries).length) {
                        var copy = recommendations
                        var reco_list = []
                        for (var i in recommendations) {
                            var best = [0, 0]
                            for (var key in copy) {
                                if (recommendations[key].score > best[1]) {
                                    best = [key, recommendations[key].score]
                                }
                            }
                            reco_list.push(recommendations[best[0]])
                            delete copy[best[0]]
                        }
                        recommendedSeries = reco_list;
                        console.log(recommendedSeries)
                        deferred.resolve("Success");
                    }
                });
            };
        } else {
            deferred.reject("Error");
        }
        return deferred.promise;
    };
    return recommendationService;
})