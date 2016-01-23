'use strict';

/* App Module */

var cuddlyApp = angular.module('cuddlyApp', [
  'ui.router',
  'cuddlyControllers',
  'cuddlyServices',
  'angularMoment'
]);

cuddlyApp.config(['$stateProvider', '$urlRouterProvider',
  function($stateProvider, $urlRouterProvider) {
    $stateProvider
      .state('login', {
        url: '/login',
        templateUrl: 'partials/login.html',
        controller: 'loginCtrl'
      })
      .state('home', {
        url: '/home',
        templateUrl: 'partials/home.html',
        controller: 'homeCtrl'
      })
      .state('episode',{
        url: '/episode/:serieId/:seasonNumber/:episodeNumber',
        templateUrl: 'partials/episode.html',
        controller: 'episodePageCtrl'
      })
      .state('serie', {
        url: '/serie/:serieId',
        templateUrl: 'partials/serie.html',
        controller: 'seriePageCtrl'
      })
      .state('followed_series',{
        url: '/followed_series/:emailUser',
        templateUrl: 'partials/followed_series.html',
        controller: 'followedSeriesPageCtrl'
      })
      .state('calendar',{
        url : '/calendar/:emailUser',
        templateUrl: 'partials/calendar.html',
        controller: 'calendarPageCtrl'
      });
      $urlRouterProvider.otherwise('/home');
  }]);
