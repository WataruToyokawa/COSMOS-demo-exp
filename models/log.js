'use strict';

const mongoose = require( 'mongoose' );

const logSchema = new mongoose.Schema({
  text: String,
  tags: {type: Array, index: true},
  timestamp: {type: Date, index: true, default: Date.now}
});

module.exports = mongoose.model("Logs", logSchema); 