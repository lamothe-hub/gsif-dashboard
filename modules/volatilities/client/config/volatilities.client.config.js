(function () {
  'use strict';

  angular
    .module('volatilities')
    .run(menuConfig);

  menuConfig.$inject = ['menuService'];

  function menuConfig(menuService) {
    // Set top bar menu items
    menuService.addMenuItem('topbar', {
      title: 'Volatilities',
      state: 'volatilities',
      type: 'dropdown',
      roles: ['*']
    });

    // Add the dropdown list item
    menuService.addSubMenuItem('topbar', 'volatilities', {
      title: 'List Volatilities',
      state: 'volatilities.list'
    });

    // Add the dropdown create item
    menuService.addSubMenuItem('topbar', 'volatilities', {
      title: 'Create Volatility',
      state: 'volatilities.create',
      roles: ['user']
    });
  }
}());
