'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * Volatility Schema
 */
var VolatilitySchema = new Schema({
  name: {
    type: String,
    default: '',
    required: 'Please fill Volatility name',
    trim: true
  },
  created: {
    type: Date,
    default: Date.now
  },
  user: {
    type: Schema.ObjectId,
    ref: 'User'
  }
});

mongoose.model('Volatility', VolatilitySchema);
