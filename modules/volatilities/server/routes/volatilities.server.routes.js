'use strict';

/**
 * Module dependencies
 */
var volatilitiesPolicy = require('../policies/volatilities.server.policy'),
  volatilities = require('../controllers/volatilities.server.controller');

module.exports = function(app) {
  // Volatilities Routes
 /* app.route('/api/volatilities').all(volatilitiesPolicy.isAllowed)
    .get(volatilities.list)
    .post(volatilities.create);*/

  app.route('/api/volatilities/getPrice')
    .post(volatilities.list_ticker_price);

  app.route('/api/volatilities/getSummary')
  .post(volatilities.list_ticker_summary);

  // Finish by binding the Volatility middleware
  app.param('volatilityId', volatilities.volatilityByID);
};
