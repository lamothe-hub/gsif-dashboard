// Volatilities service used to communicate Volatilities REST endpoints
(function () {
  'use strict';

  angular
    .module('volatilities')
    .factory('VolatilitiesService', VolatilitiesService);

  VolatilitiesService.$inject = ['$http','$resource'];

  function VolatilitiesService($http) {

    var methods = {

      getPrice: function(tickers) {
        // $http.get(host + '/api/students');
        console.log(tickers);
        return $http.post('/api/volatilities/getPrice', tickers);
      }, 

      getSummary: function(tickers){
        return $http.post('/api/volatilities/getSummary', tickers);
      }

    };

    return methods;
  }

}());
