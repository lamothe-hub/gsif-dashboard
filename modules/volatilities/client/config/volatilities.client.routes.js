(function () {
  'use strict';

  angular
    .module('volatilities')
    .config(routeConfig);

  routeConfig.$inject = ['$stateProvider'];

  function routeConfig($stateProvider) {
    $stateProvider
      .state('volatilities', {
        abstract: true,
        url: '/volatilities',
        template: '<ui-view/>'
      })
      .state('volatilities.list', {
        url: '',
        templateUrl: 'modules/volatilities/client/views/list-volatilities.client.view.html',
        controller: 'VolatilitiesController',
        controllerAs: 'vm',
        data: {
          pageTitle: 'Volatilities List'
        }
      })
      .state('volatilities.create', {
        url: '/create',
        templateUrl: 'modules/volatilities/client/views/form-volatility.client.view.html',
        controller: 'VolatilitiesController',
        controllerAs: 'vm',
        resolve: {
          volatilityResolve: newVolatility
        },
        data: {
          roles: ['user', 'admin'],
          pageTitle: 'Volatilities Create'
        }
      })
      .state('volatilities.edit', {
        url: '/:volatilityId/edit',
        templateUrl: 'modules/volatilities/client/views/form-volatility.client.view.html',
        controller: 'VolatilitiesController',
        controllerAs: 'vm',
        resolve: {
          volatilityResolve: getVolatility
        },
        data: {
          roles: ['user', 'admin'],
          pageTitle: 'Edit Volatility {{ volatilityResolve.name }}'
        }
      })
      .state('volatilities.view', {
        url: '/:volatilityId',
        templateUrl: 'modules/volatilities/client/views/view-volatility.client.view.html',
        controller: 'VolatilitiesController',
        controllerAs: 'vm',
        resolve: {
          volatilityResolve: getVolatility
        },
        data: {
          pageTitle: 'Volatility {{ volatilityResolve.name }}'
        }
      });
  }

  getVolatility.$inject = ['$stateParams', 'VolatilitiesService'];

  function getVolatility($stateParams, VolatilitiesService) {
    return VolatilitiesService.get({
      volatilityId: $stateParams.volatilityId
    }).$promise;
  }

  newVolatility.$inject = ['VolatilitiesService'];

  function newVolatility(VolatilitiesService) {
    return new VolatilitiesService();
  }
}());
