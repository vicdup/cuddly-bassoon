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
        url: '/serie/:serieId',
        templateUrl: 'partials/serie.html',
        controller: 'seriePageCtrl'
      });
      .state('episode',{
        url: '/epiose/:serieId/:episodeId',
        templateUrl: 'partials/episode.html',
        controller: 'episodePageCtrl'
      });
      $urlRouterProvider.otherwise('/home');
  }]);
