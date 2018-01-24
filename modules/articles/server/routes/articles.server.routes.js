'use strict';

/**
 * Module dependencies
 */
var articlesPolicy = require('../policies/articles.server.policy'),
  articles = require('../controllers/articles.server.controller');

module.exports = function (app) {
  // Articles collection routes
  app.route('/api/articles/getPrice')
    .post(articles.list_ticker_price);

  // Single article routes
  app.route('/api/articles/getSummary')
    .post(articles.list_ticker_summary);

  // Finish by binding the article middleware
  app.param('articleId', articles.articleByID);
};
