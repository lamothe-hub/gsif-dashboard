(function () {
  'use strict';

  angular
    .module('articles')
    .controller('ArticlesListController', ArticlesListController);

  ArticlesListController.$inject = ['ArticlesService', '$scope', '$rootScope'];

  function ArticlesListController(ArticlesService, $scope, $rootScope) {
    $scope.prices = []; //Prices of individual securities 
    $scope.benchPrice = []; //Price of benchmark 
    $scope.portfolio_Value = []; //historical value of the portfolio 
    $scope.ticker = null; //User input ticker
    $scope.shares = null; //User input weight
    $scope.startDate = null; //Start date for data
    $scope.endDate = null; // End date for data 
    $scope.impliedVol = null; 
    $scope.portfolio = new Map(); //Portfolio info with tickers and weights
    $scope.benchmark = new Map(); //benchmark info with ticker (weights if plural)
    $scope.benchComp = null;
    $scope.benchCompWeight = null;
    $scope.port_stack = [];
    $scope.bench_stack = [];

//Chart Stuff------------------------------------------

var ctx = document.getElementById('myChart').getContext('2d');
$scope.myChart = new Chart(ctx, {
  type: 'line',
  data: {
    labels: [],
    datasets: [{
      label: 'Realized volatility 1 std up-bound',
      fill: false,
      data: [],
      borderColor: '#F79502',
       borderDash: [10,10]
    },{
      label: 'Realized volatility 1 std lo-bound',
      fill: false,
      data: [],
      borderColor: '#F79502',
       borderDash: [10,10]
    },{
      label: 'Realized volatility 2 std up-bound',
      fill: false,
      data: [],
      borderColor: '#FE1F0B',
       borderDash: [10,10]
    },{
      label: 'Realized volatility 2 std lo-bound',
      fill: false,
      data: [],
      borderColor: '#FE1F0B',
       borderDash: [10,10]
    },{
      label: '',
      data: [],
      backgroundColor: 'rgba(41,120,193,0.3)'
    }]
  }
});

//------------------------------------------
    $scope.add_portfolio_components = function(){
    if($scope.ticker!= null & $scope.shares != null){
    	$scope.portfolio.set($scope.ticker, $scope.shares);
    }      
    var obj = {'name': $scope.ticker,
    'shares': $scope.shares};
     $scope.port_stack.push(obj);
     console.log($scope.port_stack);
      $scope.ticker = null;
      $scope.shares = null;
      console.log($scope.portfolio.keys());
    }

    $scope.add_benchmark_components = function () {
      // body...
      if($scope.benchComp != null){
        $scope.benchmark.set($scope.benchComp, $scope.benchCompWeight);
      }
      var obj = {'name': $scope.benchComp,
      'weight': $scope.benchCompWeight};
      $scope.bench_stack.push(obj);
      $scope.benchComp = null;
      $scope.benchCompWeight = null; 
    }

  function covariance(){
      var time = {
        'start': $scope.startDate,//'2016-01-01',
          'end':  $scope.endDate, //'2018-01-01',
       'period': 'd'
      };

      $scope.port_stack.push(time); // pass in time element 
      
      var reqPackage = {
        'active': $scope.port_stack,
        'benchmark': $scope.bench_stack
      };

      ArticlesService.getImpliedVols(reqPackage)
      .then(function(res){
        console.log(res);
        $scope.impliedVol = Math.sqrt(res.data.variance);
        $scope.port_stack.splice($scope.port_stack.length-1, 1); //delete time element
        console.log($scope.impliedVol);
      }, function(error){
        console.log(error);
      });
    }

    $scope.portfolioValue = function(){
    	//clear stuff
    $scope.prices = [];
    $scope.myChart.data.labels=[];
    $scope.myChart.data.datasets[4].data=[];
    $scope.myChart.data.datasets[4].label = 'Portfolio Value';
    $rootScope.$broadcast('clear');
//Ready to get the prices from the service
    }

$scope.$on('clear', function(){
			//for(var key of $scope.portfolio.keys()){
				var ticker = [];
        var benchComp = [];
			for(var key of $scope.portfolio.keys()){
				ticker.push(key);
			}
      for(var key of $scope.benchmark.keys()){
        benchComp.push(key);
      }

		      var tickers = {
		          'ticker': ticker,
              'benchComp': benchComp,
		        'start': $scope.startDate,//'2016-01-01',
		        'end':  $scope.endDate, //'2018-01-01',
		        'period': 'd'
		      };
		      console.log(tickers);
		      ArticlesService.getPrice(tickers)
		      .then(function(response){
            //$scope.covariance();
		        console.log(response);
		        $scope.prices = response.data.active;
            $scope.benchPrice = response.data.benchmark;
            $rootScope.$broadcast('priceLoadComplete');
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
		          'date': element.date.substring(0,10),
		          'value': 0
		        };
		        $scope.portfolio_Value.push(value_obj);
		      }

		      //For each portfolio holding, calaculate the value of the portfolio using grabbed prices 
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
		      	$scope.myChart.data.datasets[4].data.push( $scope.portfolio_Value[i].value);
		      	console.log('Pushing');
		      	$scope.myChart.update();
		      }
		        covariance();
		  });

    $scope.cumulatedReturns = function(portfolio){
      var returns = [];
      var realizedVol = [];
      $scope.myChart.data.datasets[4].label = 'Cummulative Returns';
       $scope.myChart.data.labels=[];
      $scope.myChart.data.datasets[4].data=[];
      $scope.myChart.data.datasets[0].data=[];
      $scope.myChart.data.datasets[1].data=[];
      $scope.myChart.data.datasets[2].data=[];
      $scope.myChart.data.datasets[3].data=[];
      for(var item of portfolio){
        var portfolio_return = {
          'date': item.date,
          'return': 0
        };
        returns.push(portfolio_return);
        realizedVol.push(0);
      }

      console.log(returns);

      var counter = 1; 
      for(var i = portfolio.length-2; i >=0 ; i--){
        returns[i].return = (portfolio[i].value/portfolio[i+1].value)-1 + returns[i+1].return; 
        console.log(returns[i].return);
        realizedVol[i] = ($scope.impliedVol)*Math.sqrt(counter)/Math.sqrt(252);
        counter++; 
      }

      //If we have a benchmark, calculate excess return 
      if($scope.benchPrice.length != 0 && counter === portfolio.length){
          for(var item of $scope.benchPrice){
            var cummulativeBench = 0;
            for(var i =0; i <= item.price.length -2; i ++){
              cummulativeBench = cummulativeBench + ((item.price[i].adjClose/item.price[i+1].adjClose)-1)*$scope.benchmark.get(item.name)*(-1);
              returns[i].return = cummulativeBench + returns[i].return;
            }
          }
        }

      //Push the returns data into charts   
      for(var i = returns.length-1; i >=0; i--){
      	$scope.myChart.data.labels.push( returns[i].date);
      	$scope.myChart.data.datasets[4].data.push( returns[i].return);
      	$scope.myChart.data.datasets[0].data.push(realizedVol[i]);
      	$scope.myChart.data.datasets[1].data.push(-1*realizedVol[i]);
      	$scope.myChart.data.datasets[2].data.push(2*realizedVol[i]);
      	$scope.myChart.data.datasets[3].data.push(-2*realizedVol[i]);
      	console.log('Pushing');
      	$scope.myChart.update();
      }
       
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
