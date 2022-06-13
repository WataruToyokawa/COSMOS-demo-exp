// /oneDimensionalTask_beta/models/amazonID.js
'use strict';

const mongoose = require('mongoose');
mongoose.set('useCreateIndex', true);
const Schema = mongoose.Schema;

const WorkerID = new Schema({
	date: { type: String, require: true },
    amazonID : { type: String, require: true, unique: true }, 
    verificationCode : { type: String },
    bonus_for_waiting: { type: String },
    completionFee: { type: String },
    totalEarning: { type: String },
    confirmationID: { type: String },
    exp_condition: { type: String },
    indivOrGroup: { type: String },
    latency: { type: String },
    age: { type: String },
    sex: { type: String },
    country: { type: String },
    q1: { type: String },
    q2: { type: String },
    q3: { type: String },
    q4: { type: String }
});

module.exports = mongoose.model('amazonID', WorkerID);