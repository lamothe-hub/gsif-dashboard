(function () {
  'use strict';

  // Volatilities controller
  angular
    .module('volatilities')
    .controller('VolatilitiesController', VolatilitiesController);

  VolatilitiesController.$inject = ['$scope', '$state', '$window', 'VolatilitiesService'];

  function VolatilitiesController ($scope, $state, $window, VolatilitiesService) {


    $scope.getPrice = function(){
      var tickers ={
        'ticker': ['AAPL'],
        'start':'2018-01-01',
        'end': '2018-01-21',
        'period': 'd'
    } ;

      VolatilitiesService.getPrice(tickers)
      .then(function(response){
        console.log(response.data);
      }, function(error){
        console.log(error);
      });
    };

    $scope.getSummary = function(){
      var tickers = {
        'ticker': ['BABA', 'AAPL'], 
        'modules': ['price', 'summaryDetail'] //recommendationTrend, earnings, calendarEvents, upgradeDowngradeHistory, defaultKeyStatistics, summaryProfile, financialData           
      }

      VolatilitiesService.getSummary(tickers)
      .then(function(response){
        var portVal = response.data.AAPL.price.regularMarketPrice * 79 + response.data.BABA.price.regularMarketPrice * 100;
        console.log(portVal);
      }, function(error){
        console.log(error);
      });
    };

    
  }
}());
