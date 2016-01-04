'use strict';

/* Services */

var cuddlyServices = angular.module('cuddlyServices', ['ngResource']);

cuddlyServices.service('apiTmdb', function($http){
	var apiTmdb = {
		getTvShowById: function(idTv) {
			var promise = $http.get('https://api.themoviedb.org/3/tv/'+idTv+'?api_key=1a3f1b0a8620851f42d4b1a95494d44d').then(function (response){
				console.log(response);
				return response.data;
			})
			return promise;
		}
	};
	return apiTmdb;

});
