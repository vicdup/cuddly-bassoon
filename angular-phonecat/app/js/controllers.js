'use strict';

/* Controllers */

var cuddlyControllers = angular.module('cuddlyControllers', []);


cuddlyControllers.controller('seriePageCtrl', ['$scope', 'apiTmdb', '$stateParams',
  function($scope, apiTmdb, $stateParams) {
  	var getMaxSeason = function(serie){
      	var seasons = serie.seasons;
      	var maxseason=0;
      	for (var i=0; i < seasons.length;i++){
      		if (seasons[i].season_number > maxseason){
      			maxseason = seasons[i].season_number;
      		}
      	}
      	return maxseason;
      }

  	$scope.serieId = $stateParams.serieId;
    apiTmdb.getSerieById($scope.serieId).then (function(d){
	    $scope.serie=d;
	    $scope.maxseason = getMaxSeason($scope.serie);
	    $scope.currentdate= new Date();

	    
	    apiTmdb.getSeasonByNumberSeason($scope.maxseason,$scope.serie.id).then(function(r){
	    	$scope.season=r;  
	    	var lastepisodedate = new Date( $scope.season.episodes[$scope.season.episodes.length-1].air_date);
	    	if ($scope.currentdate.getTime() > lastepisodedate.getTime()){
	    		$scope.serieStatus = "Finished";
		    }
		    else{
		    	$scope.serieStatus = "On going";
		    }
	    })

    })
  }
]);

cuddlyControllers.controller('episodePageCtrl', ['$scope', 'apiTmdb', '$stateParams',
  function($scope,apiTmdb, $stateParams){
    $scope.serieId = $stateParams.serieId;
    apiTmdb.getSerieById($scope.serieId).then(function(d){
      
    })
  }

]);