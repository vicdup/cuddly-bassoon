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
    $scope.seasonNumber = $stateParams.seasonNumber;
    $scope.episodeNumber = $stateParams.episodeNumber;

    apiTmdb.getEpisodeByNumberSeasonByEpisodeId($scope.seasonNumber,$scope.serieId,$scope.episodeNumber).then(function(d){
      $scope.episode=d;
    });

    apiTmdb.getSerieById($scope.serieId).then(function(r){
      $scope.serie = r;
    });
  }

]);


cuddlyControllers.controller('userPageCtrl', ['$scope', 'apiUserDb', 'apiTmdb', '$stateParams',
  function($scope,apiUserDb,apiTmdb,$stateParams){
    $scope.emailUser = $stateParams.emailUser;

    apiUserDb.getUserByEmail($scope.emailUser).then(function(r){
      $scope.user = r;
      $scope.series = $scope.user.series.tmdbId;
      var seriesIds = [];
      for (var i = $scope.user.series.length - 1; i >= 0; i--) {
        seriesIds.push($scope.user.series[i].tmdbId);
      };
      $scope.seriesIds = seriesIds;

      // var followed_series = [];
      // var id = 0;
      // for (id in seriesIds){
      //   followed_series.push(apiTmdb.getSerieById(seriesIds[id]));
      // };

      // $scope.followed_series = followed_series;
      
    });
  }

]);