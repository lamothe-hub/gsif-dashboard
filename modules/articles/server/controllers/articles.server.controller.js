'use strict';

/**
 * Module dependencies
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Article = mongoose.model('Article'),
   request = require('request'),
  yahooFin = require('yahoo-finance'),
  math = require('mathjs'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));

/*
Getting historical Data
*/

global.hisPrice = [];
exports.list_ticker_price = function(req, res) {
var tickers = req.body;
var i =0;

  yahooFin.historical({
      symbols: tickers.ticker,
      from: tickers.start,
      to: tickers.end,
      period: tickers.period
    }).then(function(quotes){
      console.log(quotes);
      //console.log("Fetching " + quotes[0].symbol + " historial prices ...");
      for(var stuff in quotes){
        console.log(quotes[stuff]);
        var quote = {
        'name': stuff,
        'price': quotes[stuff]
      };
      global.hisPrice.push(quote); 
      
      } 
      console.log(global.hisPrice);  
      res.json(global.hisPrice);
      global.hisPrice = [];
    });
  



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
 * Article middleware
 */
exports.articleByID = function (req, res, next, id) {

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'Article is invalid'
    });
  }

  Article.findById(id).populate('user', 'displayName').exec(function (err, article) {
    if (err) {
      return next(err);
    } else if (!article) {
      return res.status(404).send({
        message: 'No article with that identifier has been found'
      });
    }
    req.article = article;
    next();
  });
};
