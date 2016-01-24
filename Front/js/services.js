'use strict';

/* Services */

var cuddlyServices = angular.module('cuddlyServices', ['ngResource']);

cuddlyServices.service('apiTmdb', function($http){
	var apiTmdb = {
		getSerieById: function(idSerie) {
			var promise = $http.get('https://api.themoviedb.org/3/tv/'+idSerie+'?api_key=1a3f1b0a8620851f42d4b1a95494d44d').then(function (response){
				console.log(response);
				return response.data;
			})
			return promise;
		},
		getSeasonByNumberSeason: function(idSeason,idSerie) {
			var promise = $http.get('https://api.themoviedb.org/3/tv/'+idSerie+'/season/'+idSeason+'?api_key=1a3f1b0a8620851f42d4b1a95494d44d').then(function (response){
				console.log(response);
				return response.data;
			})
			return promise;
		},

		getEpisodeByNumberSeasonByEpisodeId: function(seasonNumber,idSerie,episodeNumber){
			var promise = $http.get('https://api.themoviedb.org/3/tv/'+idSerie+'/season/'+seasonNumber+'/episode/'+episodeNumber+'?api_key=1a3f1b0a8620851f42d4b1a95494d44d').then(function(response){
				console.log(response);
				return response.data
			})
			return promise
		}


	};
	return apiTmdb;

});


cuddlyServices.service('apiUserDb', function($http){
	var user = {};
	var authenticated = false;
	var apiUserDb = {
		getUserByEmail: function(emailUser){
			var promise = $http.get('http://188.166.78.202:3000/API/users/'+emailUser).then(function successCallback(response) {
				console.log(response);
				user = response.data;
				if (response.data == ""){
					authenticated = false;
				}
				else {
					authenticated = true;
				}
				console.log(authenticated);
				return response.data;

			}, function errorCallback(response) {
				console.log("Mauvais user");
			})
			return promise;
		},
		getCurrentUser: function(){
			console.log(user);
			return user;
		},
		isAuthenticated: function() {
			return authenticated;
		}

	};
	return apiUserDb;

});

cuddlyServices.factory('recommendations', function(apiUserDb){
	var recommendedSeries = {};
	var followedSeries = {};
	var recommendationService = {};
	recommendationService.getRecommendations = function() {
		return recommendedSeries;
	};
	recommendationService.getFollowedSeries = function () {
		return followedSeries;
	};
	recommendationService.updateFollowedSeries = function() {
		for (serie in apiUserDb.user.series) {
			followedSeries[serie.tmdbId] = true;
		};
	};
	recommendationService.updateRecommendations = function() {
		var recommendations = {};
		for (serieId in followedSeries) {
			$http.get('https://api.themoviedb.org/3/tv/'+serieId+'similar?api_key=1a3f1b0a8620851f42d4b1a95494d44d&page=1').then(function(response){
				var tempSimilars = response.data.results;
				for (var i = 0; i < response.data.results.length; i++) {
					currentId = tempSimilars[i].id
					if (currentId in recommendations) {
						recommendations[currentId].score += 1;
					}
					else {
						recommendations[currentId].score = 1;
						recommendations[currentId].popularity = tempSimilars[i].popularity;
					}
				};
			});
		};
		recommendedSeries = recommendations;
	};
})