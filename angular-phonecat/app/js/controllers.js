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


cuddlyControllers.controller('followedSeriesPageCtrl', ['$scope', 'apiUserDb', 'apiTmdb', '$stateParams',
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
      var maxseasons = [];
      var nextepisodes = [];
      for (id in seriesIds){
        apiTmdb.getSerieById(seriesIds[id]).then(function(d){
        followed_series.push(d);
        maxseasons[d.id]= getMaxSeason(d);
        $scope.currentdate= new Date();
        apiTmdb.getSeasonByNumberSeason(getMaxSeason(d),d.id).then(function(r){
            $scope.season=r; 
            var lastepisodedate = new Date( $scope.season.episodes[$scope.season.episodes.length-1].air_date);
            if ($scope.currentdate.getTime() > lastepisodedate.getTime()){
              etats_series[d.id] = "Finished";
              nextepisodes[d.id] = $scope.season.episodes[$scope.season.episodes.length-1].episode_number;
            }
            else{
              etats_series[d.id] = "On going";
              var nextepisode = $scope.season.episodes[$scope.season.episodes.length - 1];
              for (var i = $scope.season.episodes.length - 1; i >= 0; i--) {
                var episodeairdate = new Date($scope.season.episodes[i].air_date);
                var nextepisodeairdate = new Date(nextepisode.air_date);
                if (episodeairdate.getTime() < nextepisodeairdate.getTime()){
                  if (episodeairdate.getTime() >= $scope.currentdate.getTime()){
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
      $scope.etats_series = etats_series;  
      $scope.maxseasons = maxseasons;
      $scope.nextepisodes = nextepisodes
    });
  }

]);

cuddlyControllers.controller('calendarPageCtrl', ['$scope', 'apiUserDb', 'apiTmdb', '$stateParams',
   function($scope,apiUserDb,apiTmdb,$stateParams) {
    $scope.emailUser = $stateParams.emailUser;
    apiUserDb.getUserByEmail($scope.emailUser).then(function(r){
      $scope.user = r;
      $scope.series = $scope.user.series.tmdbId;
      var seriesIds = [];
      for (var i = $scope.user.series.length - 1; i >= 0; i--) {
        seriesIds.push($scope.user.series[i].tmdbId);
      };
      var currentdate = new Date();
      $scope.currentmonth = currentdate.getMonth();
      $scope.currentyear = currentdate.getYear();
      var episodes = []
      for (var i = seriesIds.length - 1; i >= 0; i--) {
        apiTmdb.getSerieById(seriesIds[i]).then(function(d){
          var serie = d;
          for (var j = serie.seasons.length - 1; j >= 0; j--) {
            apiTmdb.getSeasonByNumberSeason(serie.seasons[j].season_number,serie.id).then(function(t){
              for (var k = t.episodes.length - 1; k >= 0; k--) {
                var episodedate = new Date(t.episodes[k].air_date);
                if ($scope.currentmonth == 1){
                  if ((episodedate.getYear() == $scope.currentyear && episodedate.getMonth() == $scope.currentmonth) || (episodedate.getYear() == $scope.currentyear  && episodedate.getMonth() == $scope.currentmonth + 1)){
                      episodes.push(t.episodes[k])
                  };
                  if (episodedate.getMonth() == 12 && episodedate.getYear() == $scope.currentyear - 1) {
                    episodes.push(t.episodes[k]);
                  };
                };
                if ($scope.currentmonth == 12){
                  if ((episodedate.getYear() == $scope.currentyear && episodedate.getMonth() == $scope.currentmonth) || (episodedate.getYear() == $scope.currentyear  && episodedate.getMonth() == $scope.currentmonth - 1)){
                      episodes.push(t.episodes[k])
                  };
                  if (episodedate.getMonth() == 1 && episodedate.getYear() == $scope.currentyear + 1) {
                    episodes.push(t.episodes[k]);
                  };
                };
                if (episodedate.getYear() == $scope.currentyear && episodedate.getMonth() >= $scope.currentmonth - 1 && episodedate.getMonth() <= $scope.currentmonth + 1){
                  episodes.push(t.episodes[k]);
                };
              };
            })
          };
        });      
      };
      $scope.months = []
      $scope.months.push($scope.currentmonth - 1);  
      $scope.months.push($scope.currentmonth);  
      $scope.months.push($scope.currentmonth + 1);  
      $scope.episodes  = episodes;
    });
  }
]);