(function () {
  'use strict';

  angular
    .module('articles.services')
    .factory('ArticlesService', ArticlesService);

  ArticlesService.$inject = ['$http','$resource'];

  function ArticlesService($http) {
    var methods = {

      getPrice: function(tickers) {
        // $http.get(host + '/api/students');
        //console.log(tickers);
        return $http.post('/api/articles/getPrice', tickers);
      }, 

      getSummary: function(tickers){
        return $http.post('/api/articles/getSummary', tickers);
      },

      createManager: function(manager){
        return $http.post('/api/articles/createManager', manager);
      },

      getImpliedVols: function(tickers){
        return $http.post('/api/articles/impliedVols', tickers);
      }

    };

    return methods;
  }
}());
