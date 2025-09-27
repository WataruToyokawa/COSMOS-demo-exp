'use strict';

// config/constants.js or config/game.js

const { makeid } = require('../utils/helpers'); // adjust path if needed

// Experimental variables
const PORT = process.env.PORT || 8989;
const ipAddress = 'http://tk2-127-63496.vs.sakura.ne.jp/'
const horizon = 15;
const sessionNo = 0; // 0 = debug
const maxGroupSize = 10; //
const minGroupSize = 2; //4
const maxWaitingTime = 20*1000; //3*60*1000
const num_cell = 4;
const numOptions = num_cell * num_cell; // 
const maxChoiceStageTime = 15*1000; //20*1000 // ms
const maxTimeTestScene = 4* 60*1000; // 4*60*1000
const payoff_diff_btw_gr = 150;
const options = [];

for (let i = 1; i <= numOptions; i++) {
  options.push(i);
}

// experimental server
const firstRoomName = makeid(8) + '_session_' + sessionNo;
const	roomStatus = {};
const sessionNameSpace = {};

// Date and time (formatted with leading zeros)
const now = new Date();
const myMonth = String(now.getMonth() + 1).padStart(2, '0');
const myDate  = String(now.getUTCDate()).padStart(2, '0');
const myHour  = String(now.getUTCHours()).padStart(2, '0');
const myMin   = String(now.getUTCMinutes()).padStart(2, '0');

module.exports = {
  PORT,
  horizon,
  sessionNo,
  maxGroupSize,
  minGroupSize,
  maxWaitingTime,
  numOptions,
  maxChoiceStageTime,
  maxTimeTestScene,
  payoff_diff_btw_gr,
  options,
  firstRoomName,
  roomStatus,
  sessionNameSpace,
  myMonth,
  myDate,
  myHour,
  myMin
};
