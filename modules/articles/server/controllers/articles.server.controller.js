'use strict';

/**
 * Module dependencies
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Manager = mongoose.model('Manager'),
   request = require('request'),
  yahooFin = require('yahoo-finance'),
  math = require('mathjs'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));

/*
Getting historical Data
*/
global.hisPrice = [];
global.start = null;
global.end = null; 

exports.list_ticker_price = function(req, res) {
  var tickers = req.body;
  var i =0;
  global.hisPrice = [];
  global.start = tickers.start;
  global.end = tickers.end;

  yahooFin.historical({
      symbols: tickers.ticker,
      from: tickers.start,
      to: tickers.end,
      period: tickers.period
    }).then(function(quotes){
      //console.log(quotes);
      //console.log("Fetching " + quotes[0].symbol + " historial prices ...");
      for(var stuff in quotes){
        //console.log(quotes[stuff]);
        var quote = {
        'name': stuff,
        'price': quotes[stuff]
      };
      global.hisPrice.push(quote); 
      
      } 
      //console.log(global.hisPrice);  
      res.json(global.hisPrice);
      //global.hisPrice = [];
    });
};

function correlation(x, y){
      // body...
      var shortestArrayLength = 0;
     
    if(x.length == y.length) {
        shortestArrayLength = x.length;
    } else if(x.length > y.length) {
        shortestArrayLength = y.length;
        console.error('x has more items in it, the last ' + (x.length - shortestArrayLength) + ' item(s) will be ignored');
    } else {
        shortestArrayLength = x.length;
        console.error('y has more items in it, the last ' + (y.length - shortestArrayLength) + ' item(s) will be ignored');
    }
  
    var xy = [];
    var x2 = [];
    var y2 = [];
  
    for(var i=0; i<shortestArrayLength; i++) {
        xy.push(x[i] * y[i]);
        x2.push(x[i] * x[i]);
        y2.push(y[i] * y[i]);
    }
  
    var sum_x = 0;
    var sum_y = 0;
    var sum_xy = 0;
    var sum_x2 = 0;
    var sum_y2 = 0;
  
    for(var i=0; i< shortestArrayLength; i++) {
        sum_x += x[i];
        sum_y += y[i];
        sum_xy += xy[i];
        sum_x2 += x2[i];
        sum_y2 += y2[i];
    }
  
    var step1 = (shortestArrayLength * sum_xy) - (sum_x * sum_y);
    var step2 = (shortestArrayLength * sum_x2) - (sum_x * sum_x);
    var step3 = (shortestArrayLength * sum_y2) - (sum_y * sum_y);
    var step4 = Math.sqrt(step2 * step3);
    var answer = step1 / step4;
  
    return answer;
};

//We need historical returns first! 
exports.covariance = function(req, res){

  if(global.hisPrice.length == 0){
    console.log("Error need historical returns first");
    res.writeHead(500, 'Need historial returns first',{
  'Content-Length': Buffer.byteLength('Need historial returns first'),
  'Content-Type': 'text/plain' });
    return;
  }
var portfolioReturns =[];
  for(var holding of global.hisPrice){
    //console.log(holding);
    var returnVec = [];
    for(var i =0; i < holding.price.length-1; i++){
      returnVec.push((holding.price[i].adjClose/holding.price[i+1].adjClose)-1);
    }
    //console.log(returnVec);
    var componentReturn = {
      'name': holding.name,
      'returns': returnVec,
      'implied_vol': null
    };

request('https://www.quandl.com/api/v3/datasets/VOL/'+holding.name+'.json?column_index=25&start_date='+global.end+'&end_date='+global.end+'&api_key=ZcDqZyg9kM9oVVuHFA1p',
    function(error, response, body){
      if(!error && response.statusCode == 200){
        console.log(body);
        var content = JSON.parse(body);
        componentReturn.implied_vol = content.dataset.data[0][1];
        portfolioReturns.push(componentReturn);
      }
    }); 
  }
  console.log(portfolioReturns);

  //console.log(correlation(portfolioReturns[0].returns, portfolioReturns[1].returns));


};

/*Get Implied Volatilities*/
exports.getImpliedVols = function(req, res){
  request('https://www.quandl.com/api/v3/datasets/VOL/AAL?column_index=25&start_date=2018-03-05&end_date=2018-03-05&api_key=ZcDqZyg9kM9oVVuHFA1p',
    function(error, response, body){
      if(!error && response.statusCode == 200){
        console.log(body);
        //test();
      }
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

/* Create Manager*/
exports.create = function(req, res){
  var Manager = new Manager(req.body);

  Manager.user = req.body.user;
  Manager.portfolio = req.body.portfolio; 

  Manager.save(function(err){
    if(err){
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    }
    res.jsonp(Manager);
  });
};

/*Update Manager*/
exports.update = function(req, res){};

/**
 * Article middleware
 */
/*exports.articleByID = function (req, res, next, id) {

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
};*/
