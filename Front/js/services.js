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
                followedSeriesIds.push(user.series[i]['tmdbId']);
            }
            console.log(followedSeriesIds);
            return followedSeriesIds
        },
        getUserByEmail: function(emailUser) {
            var promise = $http.get(addressIp + '/API/users/' + emailUser).then(function successCallback(response) {
                // console.log(response);
                user = response.data;
                if (response.data == "") {
                    authenticated = false;

                } else {
                    authenticated = true;
                    // console.log("coucou");

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
        postUser: function(email, name) {
            var content = {
                "email": email,
                "name": name,
                "avatar": "",
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
            console.log(user);
            return user;
        },
        updateCurrentUser: function(user) {
            return sessionStorage.user = JSON.stringify(user);
        },
        isAuthenticated: function() {
			if ($cookies.get('CBemail')!='disconnected')
			{
				return true;
			}
			else {
				return false;
			}
		},
		disconnect: function() {
			$cookies.put('CBemail','disconnected');
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
                // console.log(serie)
                followedSeries[series[serie].tmdbId] = true;
            };
            // console.log(followedSeries);
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
                        }
                    };
                    completed_request++;
                    if (completed_request == Object.keys(followedSeries).length) {
                        recommendedSeries = recommendations;
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