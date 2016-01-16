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

    $scope.previous_season = function() {
      if ($scope.seasonNumberToShow > 1) {
        $scope.seasonNumberToShow -= 1;
        apiTmdb.getSeasonByNumberSeason($scope.seasonNumberToShow,$scope.serie.id).then(function(r){
          $scope.seasonToShow = r;
        })
      }
    }

    $scope.next_season = function() {
      if ($scope.seasonNumberToShow < $scope.maxseason) {
        $scope.seasonNumberToShow += 1;
        apiTmdb.getSeasonByNumberSeason($scope.seasonNumberToShow,$scope.serie.id).then(function(r){
          $scope.seasonToShow = r;
        })
      }
    }

  	$scope.serieId = $stateParams.serieId;
    apiTmdb.getSerieById($scope.serieId).then (function(d){
	    $scope.serie=d;
	    $scope.maxseason = getMaxSeason($scope.serie);
	    $scope.currentdate= new Date();
      $scope.serieFollowed = true;

	    
	    apiTmdb.getSeasonByNumberSeason($scope.maxseason,$scope.serie.id).then(function(r){
	    	$scope.season=r;
        $scope.seasonToShow = r;
        $scope.seasonNumberToShow = $scope.seasonToShow.season_number;  
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

    $scope.emailUser = $stateParams.emailUser;
    apiUserDb.getUserByEmail($scope.emailUser).then(function(r){
      $scope.user = r;
      $scope.series = $scope.user.series.tmdbId;
      var seriesIds = [];
      for (var i = $scope.user.series.length - 1; i >= 0; i--) {
        seriesIds.push($scope.user.series[i].tmdbId);
      };

      var followed_series = [];
      var id = 0;
      var etats_series = [];
      for (id in seriesIds){
        apiTmdb.getSerieById(seriesIds[id]).then(function(d){
        followed_series.push(d);
        $scope.maxseason = getMaxSeason(d);
        $scope.currentdate= new Date();
        apiTmdb.getSeasonByNumberSeason($scope.maxseason,d.id).then(function(r){
            $scope.season=r; 
            var lastepisodedate = new Date( $scope.season.episodes[$scope.season.episodes.length-1].air_date);
            if ($scope.currentdate.getTime() > lastepisodedate.getTime()){
              etats_series[d.id] = "Finished";
            }
            else{
              etats_series[d.id] = "On going";
            }
          })
        });
      }
      $scope.followed_series = followed_series;
      $scope.etats_series = etats_series;  
    });
  }

]);