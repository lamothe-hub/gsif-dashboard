'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Volatility = mongoose.model('Volatility'),
  request = require('request'),
  yahooFin = require('yahoo-finance'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  _ = require('lodash');




exports.list_ticker_price = function(req, res) {
var tickers = req.body;
  yahooFin.historical({
  	symbols: tickers.ticker,
  	from: tickers.start,
  	to: tickers.end,
  	period: tickers.period
  }, function(err, quotes){
  	res.json(quotes);
  });
};

exports.list_ticker_summary = function(req, res){
var ticker = req.body; 

yahooFin.quote({
	symbols: ticker.ticker,
	modules: ticker.modules
}, function(err, quotes){
	res.json(quotes);
});

};


/**
 * Volatility middleware
 */
exports.volatilityByID = function(req, res, next, id) {

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'Volatility is invalid'
    });
  }

  Volatility.findById(id).populate('user', 'displayName').exec(function (err, volatility) {
    if (err) {
      return next(err);
    } else if (!volatility) {
      return res.status(404).send({
        message: 'No Volatility with that identifier has been found'
      });
    }
    req.volatility = volatility;
    next();
  });
};
