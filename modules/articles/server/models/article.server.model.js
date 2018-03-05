'use strict';

/**
 * Module dependencies
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema；

/**
 * Article Schema
 */
var ManagerSchema = new Schema({
  created: {
    type: Date,
    default: Date.now
  },
  portfolio: {
    type: Map
  },
  user: {
    type: Schema.ObjectId,
    ref: 'User'
  }
});

mongoose.model('Manager', ManagerSchema);
