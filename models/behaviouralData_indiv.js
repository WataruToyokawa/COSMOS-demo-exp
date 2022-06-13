// /oneDimensionalTask_beta/models/behaviouralData.js
'use strict';

const mongoose = require('mongoose');
mongoose.set('useCreateIndex', true);
const Schema = mongoose.Schema;

const Behaviour = new Schema({
    date: { type: String, require: false },
	time: { type: String, require: false },
    amazonID : { type: String, require: false, unique: false }, 
    exp_condition : { type: String, require: false },
    isLeftRisky : { type: String, require: false },
    indivOrGroup : { type: String, require: false },
    riskDistributionId : { type: String, require: false },
    groupSize : { type: String, require: false },
    room : { type: String, require: false },
    confirmationID : { type: String, require: false },
    subjectNumber : { type: String, require: false },
    amazonID : { type: String, require: false },
    round: { type: String, require: false },
    choice: { type: String, require: false },
    payoff: { type: String, require: false },
    totalEarning: { type: String, require: false },
    // socialFreq_safe: { type: String, require: false },
    // socialFreq_risky: { type: String, require: false },
    socialFreq_safe1: { type: String, require: false },
    socialFreq_safe2: { type: String, require: false },
    socialFreq_safe3: { type: String, require: false },
    socialFreq_risky: { type: String, require: false },
    behaviouralType: { type: String, require: false },
    timeElapsed: { type: String, require: false },
    latency: { type: String, require: false },
    socialInfo_00: { type: String, require: false },
    socialInfo_01: { type: String, require: false },
    socialInfo_02: { type: String, require: false },
    socialInfo_03: { type: String, require: false },
    socialInfo_04: { type: String, require: false },
    socialInfo_05: { type: String, require: false },
    socialInfo_06: { type: String, require: false },
    socialInfo_07: { type: String, require: false },
    socialInfo_08: { type: String, require: false },
    socialInfo_09: { type: String, require: false },
    socialInfo_10: { type: String, require: false },
    socialInfo_11: { type: String, require: false },
    publicInfo_00: { type: String, require: false },
    publicInfo_01: { type: String, require: false },
    publicInfo_02: { type: String, require: false },
    publicInfo_03: { type: String, require: false },
    publicInfo_04: { type: String, require: false },
    publicInfo_05: { type: String, require: false },
    publicInfo_06: { type: String, require: false },
    publicInfo_07: { type: String, require: false },
    publicInfo_08: { type: String, require: false },
    publicInfo_09: { type: String, require: false },
    publicInfo_10: { type: String, require: false },
    publicInfo_11: { type: String, require: false }
},
    //{collection:"pilot_debug"}
    //{collection:"pilot_experiment"}
    //{collection:"postPilot_debug"}
    // {collection:"postPilot_debug_indiv"}
    //{collection:"experimental_sessions"}
    //{collection:"experimental_sessions_indiv"}
    //{collection:"debug_collection"}
    //{collection:"pilot_2_experiment"}
    //{collection:"experimental_sessions_indiv_2"}
    //{collection:"pilot_4ab_indiv"}
    //{collection:"experiment_4ab_indiv"}
    {collection:"revision_exp_debug_indiv"}
    // {collection:"revision_exp_indiv"}
);

module.exports = mongoose.model('behaviour', Behaviour);
