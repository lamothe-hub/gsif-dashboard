(function () {
  'use strict';

  angular
    .module('articles')
    .controller('ArticlesListController', ArticlesListController);

  ArticlesListController.$inject = ['ArticlesService', '$scope', '$rootScope'];

  function ArticlesListController(ArticlesService, $scope, $rootScope) {
    $scope.prices = []; //Prices of individual securities 
    $scope.portfolio_Value = []; //historical value of the portfolio 
    $scope.ticker = null; //User input ticker
    $scope.shares = null; //User input weight
    $scope.startDate = null; //Start date for data
    $scope.endDate = null; // End date for data 
    $scope.impliedVol = null; 
    $scope.portfolio = new Map(); //Portfolio info with tickers and weights

//Chart Stuff------------------------------------------

var ctx = document.getElementById('myChart').getContext('2d');
$scope.myChart = new Chart(ctx, {
  type: 'line',
  data: {
    labels: [],
    datasets: [{
      label: '',
      data: [],
      backgroundColor: "rgba(153,255,51,0.4)"
    },{
      label: 'Realized volatility 1 std up-bound',
      fill: false,
      data: [],
      borderColor: 'black',
       borderDash: [10,10]
    },{
      label: 'Realized volatility 1 std lo-bound',
      fill: false,
      data: [],
      borderColor: 'black',
       borderDash: [10,10]
    },{
      label: 'Realized volatility 2 std up-bound',
      fill: false,
      data: [],
      borderColor: 'red',
       borderDash: [10,10]
    },{
      label: 'Realized volatility 2 std lo-bound',
      fill: false,
      data: [],
      borderColor: 'red',
       borderDash: [10,10]
    },]
  }
});

//------------------------------------------
    $scope.add_portfolio_components = function(){
    if($scope.ticker!= null & $scope.shares != null){
    	$scope.portfolio.set($scope.ticker, $scope.shares);
    }      
      $scope.ticker = null;
      $scope.shares = null;
      console.log($scope.portfolio);
    }

    $scope.portfolioValue = function(){
    	//clear stuff
    $scope.prices = [];
    $scope.myChart.data.labels=[];
    $scope.myChart.data.datasets[0].data=[];
     $scope.myChart.data.datasets[0].label = 'Portfolio Value';
    console.log("1");
    $rootScope.$broadcast('clear');
//Getting the prices from the service
		 
 
    }

$scope.$on('clear', function(){
			//for(var key of $scope.portfolio.keys()){
				var ticker = [];
			for(var key of $scope.portfolio.keys()){
				ticker.push(key);
			}
		      var tickers = {
		          'ticker': ticker,
		        'start': $scope.startDate,//'2016-01-01',
		        'end':  $scope.endDate, //'2018-01-01',
		        'period': 'd'
		      };
		      console.log(tickers);
		      ArticlesService.getPrice(tickers)
		      .then(function(response){
		        console.log(response);
		        $scope.prices = response.data;$rootScope.$broadcast('priceLoadComplete');
		      }, function(error){
		        console.log(error);
		      });
		   // }
		     console.log("2");
		     console.log($scope.prices);
		    
		  
		});  

$scope.$on('priceLoadComplete', function(){
		    	 console.log($scope.prices[0]);

		       $scope.portfolio_Value = [];
		        console.log("3");
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

		      for(var i = $scope.portfolio_Value.length-1; i >=0; i--){
		      	$scope.myChart.data.labels.push( $scope.portfolio_Value[i].date);
		      	$scope.myChart.data.datasets[0].data.push( $scope.portfolio_Value[i].value);
		      	console.log('Pushing');
		      	$scope.myChart.update();
		      }
		      
		     
		    });

    $scope.cumulatedReturns = function(portfolio){
      var returns = [];
      var realizedVol = [];
      $scope.myChart.data.datasets[0].label = 'Cummulative Returns';
       $scope.myChart.data.labels=[];
      $scope.myChart.data.datasets[0].data=[];
      $scope.myChart.data.datasets[1].data=[];
      $scope.myChart.data.datasets[2].data=[];
      $scope.myChart.data.datasets[3].data=[];
      $scope.myChart.data.datasets[4].data=[];
      for(var item of portfolio){
        var portfolio_return = {
          'date': item.date,
          'return': 0
        };
        returns.push(portfolio_return);
        realizedVol.push(0);
      }

      var counter = 1; 
      for(var i = portfolio.length-2; i >=0 ; i--){
        returns[i].return = (portfolio[i].value/portfolio[i+1].value)-1 + returns[i+1].return; 
        realizedVol[i] = ($scope.impliedVol)*Math.sqrt(counter)/Math.sqrt(252);
        counter++;
      }

      for(var i = returns.length-1; i >=0; i--){
      	$scope.myChart.data.labels.push( returns[i].date);
      	$scope.myChart.data.datasets[0].data.push( returns[i].return);
      	$scope.myChart.data.datasets[1].data.push(realizedVol[i]);
      	$scope.myChart.data.datasets[2].data.push(-1*realizedVol[i]);
      	$scope.myChart.data.datasets[3].data.push(2*realizedVol[i]);
      	$scope.myChart.data.datasets[4].data.push(-2*realizedVol[i]);
      	console.log('Pushing');
      	$scope.myChart.update();
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
