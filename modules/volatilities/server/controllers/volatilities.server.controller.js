'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Volatility = mongoose.model('Volatility'),
  request = require('request'),
  yahooFin = require('yahoo-finance'),
  math = require('mathjs'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  _ = require('lodash');

/*
Getting historical Data
*/

//global.hisPrice = [];
exports.list_ticker_price = function(req, res) {
var tickers = req.body;

	yahooFin.historical({
  	symbol: tickers.ticker,
  	from: tickers.start,
  	to: tickers.end,
  	period: tickers.period
  }).then(function(quotes){
  	console.log("Fetching " + quotes[0].symbol + " historial prices ...");
  	var quote = {
  		'name': quotes[0].symbol,
  		'price': quotes
  	};
   res.json(quote);
  	//global.hisPrice.push(quote);
  });


  global.hisPrice = [];
};

/*
Grabbing results
*/

global.summaryResult =[]; 
exports.list_ticker_summary = function(req, res){
var ticker = req.body;


for(var i = 0; i < ticker.ticker.length; i ++){
	yahooFin.quote({	
		symbol: ticker.ticker[i],
		modules: ticker.modules
	}).then(function(quote){
		//console.log(quote);
		global.summaryResult.push(quote);
	});	
}

res.json(global.summaryResult);
global.summaryResult = [];

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
