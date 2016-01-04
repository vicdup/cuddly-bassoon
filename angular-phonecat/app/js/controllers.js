'use strict';

/* Controllers */

var cuddlyControllers = angular.module('cuddlyControllers', []);

cuddlyControllers.controller('tvShowPageCtrl', ['$scope', 'apiTmdb',
  function($scope, apiTmdb) {
    apiTmdb.getTvShowById(550).then (function(d){
      $scope.tvshow=d;
    })
  }
  ]);