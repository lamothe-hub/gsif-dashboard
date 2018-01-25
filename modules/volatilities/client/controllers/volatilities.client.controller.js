(function () {
  'use strict';

  // Volatilities controller
  angular
    .module('volatilities', [])
    .controller('VolatilitiesController', VolatilitiesController);

  VolatilitiesController.$inject = ['$scope', '$state', '$window', 'VolatilitiesService'];

  function VolatilitiesController ($scope, $state, $window, VolatilitiesService) {

    $scope.prices = []; //Prices of individual securities 
    $scope.portfolio_Value = []; //historical value of the portfolio 
    $scope.ticker = ''; //User input ticker
    $scope.shares = ''; //User input weight
    $scope.portfolio = new Map(); //Portfolio info with tickers and weights
//------------------------------------------
/* $scope.labels = ["January", "February", "March", "April", "May", "June", "July"];
  $scope.series = ['Series A', 'Series B'];
  $scope.data = [
    [65, 59, 80, 81, 56, 55, 40],
    [28, 48, 40, 19, 86, 27, 90]
  ];
  $scope.onClick = function (points, evt) {
    console.log(points, evt);
  };
  $scope.datasetOverride = [{ yAxisID: 'y-axis-1' }, { yAxisID: 'y-axis-2' }];
  $scope.options = {
    scales: {
      yAxes: [
        {
          id: 'y-axis-1',
          type: 'linear',
          display: true,
          position: 'left'
        },
        {
          id: 'y-axis-2',
          type: 'linear',
          display: true,
          position: 'right'
        }
      ]
    }
  };*/

//------------------------------------------
    $scope.add_portfolio_components = function(){
      $scope.portfolio.set($scope.ticker, $scope.shares);
      console.log($scope.portfolio);
    }

    $scope.portfolioValue = function(){
//Getting the prices from the service
    for(var key of $scope.portfolio.keys()){
      var tickers = {
          'ticker': key,
        'start':'2016-01-01',
        'end': '2018-01-01',
        'period': 'd'
      };
      
      VolatilitiesService.getPrice(tickers)
      .then(function(response){
        //console.log(response);
        $scope.prices.push(response.data);
      }, function(error){
        console.log(error);
      });
    }
      console.log($scope.prices);

       $scope.portfolio_Value = [];

      for(var element of $scope.prices[0].price){
        var value_obj = {
          'date': element.date,
          'value': 0
        };
        $scope.portfolio_Value.push(value_obj);
      }

      //For each portfolio holding, claculate the value of the portfolio using grabbed prices 
      for(var key of $scope.portfolio.keys()){
        var hisPrice = $scope.prices.find(function(element){
          return element.name == key;
        });

        for(var i =0; i < hisPrice.price.length; i++){        
          $scope.portfolio_Value[i].value = $scope.portfolio_Value[i].value + hisPrice.price[i].adjClose*$scope.portfolio.get(key);         
        }

      }

      console.log($scope.portfolio_Value);

      $scope.prices = [];
 
    }

    $scope.cumulatedReturns = function(portfolio){
      var returns = [];
      for(var item of portfolio){
        var portfolio_return = {
          'date': item.date,
          'return': 0
        };
        returns.push(portfolio_return);
      }

      for(var i = portfolio.length-2; i >=0 ; i--){
        returns[i].return = (portfolio[i].value/portfolio[i+1].value)-1 + returns[i+1].return; 
      }
      console.log(returns);
    }
 

   /* $scope.tickers = ['BABA', 'AAPL', 'TCEHY', 'AMZN'];

    $scope.getSummary = function(){
     
      var bundle = {
        'ticker': $scope.tickers, 
        'modules': ['price', 'summaryDetail'] //recommendationTrend, earnings, calendarEvents, upgradeDowngradeHistory, defaultKeyStatistics, summaryProfile, financialData           
      };

      VolatilitiesService.getSummary(bundle)
      .then(function(response){
     //   var portVal = response.data.AAPL.price.regularMarketPrice * 79 + response.data.BABA.price.regularMarketPrice * 100;
        console.log(response); 

      }, function(error){
       console.log(error);
      });
    };*/
    
  }

}());
