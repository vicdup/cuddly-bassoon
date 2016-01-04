'use strict';

/* Services */

var phonecatServices = angular.module('phonecatServices', ['ngResource']);

phonecatServices.factory('Phone', ['$resource',
  function($resource){
    return $resource('phones/:phoneId.json', {}, {
      query: {method:'GET', params:{phoneId:'phones'}, isArray:true}
    });
  }]);


phonecatServices.service('apiTmdb', function($http){
	var apiTmdb = {
		// var apiKey = '1a3f1b0a8620851f42d4b1a95494d44d';

		getTvShow: function(idTv) {
			var promise = $http.get('https://api.themoviedb.org/3/tv/'+idTv+'?api_key=1a3f1b0a8620851f42d4b1a95494d44d').then(function (response){
				console.log(response);
				return response.data;
			})
			return promise;
		}
	};
	return apiTmdb;

});
