'use strict';
// utils/roomFactory.js

const { 
    createArray
    , addNoise
    , shuffle
    , weightedRand2 
} = require('./helpers'); 
const config = require('../config/constants'); 


function createRoom({ isDecoy = false, name = 'unnamedRoom' } = {}) {
    return {
        exp_condition: isDecoy ? 'decoyRoom' : '',
        optionOrder: shuffle(config.options),
        payoff_noise: addNoise(config.payoff_diff_btw_gr),
        indivOrGroup: -1,
        n: 0,
        membersID: [],
        subjectNumbers: [],
        disconnectedList: [],
        testPassed: 0,
        starting: 0,
        stage: 'firstWaiting',
        maxChoiceStageTime: config.maxChoiceStageTime,
        choiceTime: [],
        round: 1,
        doneId: createArray(config.horizon, 0),
        doneNo: Array(config.horizon).fill(0),
        socialFreq: Array(config.horizon),
        socialInfo: createArray(config.horizon, config.maxGroupSize),
        publicInfo: createArray(config.horizon, config.maxGroupSize),
        choiceOrder: createArray(config.horizon, config.maxGroupSize),
        date: createArray(config.horizon, config.maxGroupSize),
        time: createArray(config.horizon, config.maxGroupSize),
        timeSec: createArray(config.horizon, config.maxGroupSize),
        saveDataThisRound: [],
        restTime:config.maxWaitingTime
    }
}

module.exports = { createRoom };