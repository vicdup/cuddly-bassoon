'use strict';

/* Controllers */

var cuddlyControllers = angular.module('cuddlyControllers', []);

cuddlyControllers.controller('seriePageCtrl', ['$scope', 'apiTmdb',
  function($scope, apiTmdb) {
    apiTmdb.getSerieById(550).then (function(d){
      $scope.serie=d;
    })
  }
  ]);