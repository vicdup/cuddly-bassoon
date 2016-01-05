'use strict';

/* App Module */

var cuddlyApp = angular.module('cuddlyApp', [
  'ui.router',
  'cuddlyControllers',
  'cuddlyServices'
]);

cuddlyApp.config(['$stateProvider', '$urlRouterProvider',
  function($stateProvider, $urlRouterProvider) {
    $stateProvider
      .state('home', {
        url: '/home',
        templateUrl: 'partials/home.html'
      })
      .state('serie', {
        url: '/series/:serieId',
        templateUrl: 'partials/serie.html',
        controller: 'seriePageCtrl'
      });
      $urlRouterProvider.otherwise('/home');
  }]);
