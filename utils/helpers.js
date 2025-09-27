'use strict';
const config = require('../config/constants');

// multi-threading like thing in Node.js
const {isMainThread, Worker} = require('worker_threads');


function makeid(length) {
   let result           = '';
   let characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
   let charactersLength = characters.length;
   for ( let i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
   }
   return result;
}

function indexOfMax(arr) {
  if (arr.length === 0) return -1;
  let max = arr[0];
  let maxIndex = 0;
  for (let i = 1; i < arr.length; i++) {
    if (arr[i] > max) {
      max = arr[i];
      maxIndex = i;
    }
  }
  return maxIndex;
}

function weightedRand2 (spec) {
  let i, sum=0, r=Math.random();
  for (i in spec) {
    sum += spec[i];
    if (r <= sum) return i;
  }
}

function getRandomIntInclusive(max, min = 0) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min; //Both the maximum and minimum are inclusive 
  }
  
// shuffling function
function shuffle(array) {
    let currentIndex = array.length, temporaryValue, randomIndex;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {

        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        // And swap it with the current element.
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }

    return array;
}

// a function to create an n-dimensional array
function createArray(length) {
    let arr = new Array(length || 0),
        i = length;

    if (arguments.length > 1) {
        let args = Array.prototype.slice.call(arguments, 1);
        while(i--) arr[length-1 - i] = createArray.apply(this, args);
    }

    return arr;
}

function createRoomStatus(roomName, { isDecoy = false } = {}) {
    return {
      exp_condition: isDecoy ? 'decoyRoom' : '',
      riskDistributionId: getRandomIntInclusive(13, 13),
      optionOrder: shuffle(config.options),
      taskOrder: shuffle(config.task_order),
      indivOrGroup: -1,
      horizon: config.horizon,
      n: 0,
      membersID: [],
      subjectNumbers: [],
      disconnectedList: [],
      testPassed: 0,
      newGameRoundReady: 0,
      starting: 0,
      stage: 'firstWaiting',
      maxChoiceStageTime: config.maxChoiceStageTime,
      choiceTime: [],
      gameRound: 0,
      trial: 1,
      pointer: 1,
  
      doneId: createArray(config.horizon * config.totalGameRound, 0),
      doneNo: createArray(config.horizon * config.totalGameRound),
      readyNo: createArray(config.horizon * config.totalGameRound),
      socialFreq: createArray(config.horizon * config.totalGameRound, config.K),
      socialInfo: createArray(config.horizon * config.totalGameRound, config.maxGroupSize),
      publicInfo: createArray(config.horizon * config.totalGameRound, config.maxGroupSize),
      share_or_not: createArray(config.horizon * config.totalGameRound, config.maxGroupSize),
      choiceOrder: createArray(config.horizon * config.totalGameRound, config.maxGroupSize),
  
      saveDataThisRound: [],
      restTime: config.maxWaitingTime,
      groupTotalPayoff: createArray(config.horizon * config.totalGameRound, 0),
      groupCumulativePayoff: [0, 0],
      totalPayoff_perIndiv: [0],
      totalPayoff_perIndiv_perGame: new Array(config.totalGameRound).fill(0),
      groupTotalCost: [0],
      currentEnv: 0,
      envChangeTracker: 0
    };
  }

function rand(max, min = 0) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

function proceedToResult (thisRoomStatus, thisRoomName, io) {
    thisRoomStatus['stage'] = 'resultFeedback';
    console.log(' - Feedback collective payoff = ' + (thisRoomStatus['groupTotalPayoff'][thisRoomStatus['pointer']-1]) +' with socialFreq ' + (thisRoomStatus['socialFreq'][thisRoomStatus['pointer']-1]) + ' at trial = ' + (thisRoomStatus['trial']) );
    if (thisRoomStatus.n > 1) {
        io.to(thisRoomName).emit('Proceed to the result scene', thisRoomStatus);
    } else {
        io.to(thisRoomName).emit('group became too small', thisRoomStatus);
    }
}

function proceedTrial (thisRoomStatus, thisRoomName, io, config) {

    // every single individual payoff
    thisRoomStatus['totalPayoff_perIndiv'][thisRoomStatus['pointer']-1] =
        Math.round( thisRoomStatus['groupTotalPayoff'][thisRoomStatus['pointer']-1] / thisRoomStatus['n'] );
    // total individual payoff for each game
    thisRoomStatus['totalPayoff_perIndiv_perGame'][thisRoomStatus['gameRound']] +=
    thisRoomStatus['totalPayoff_perIndiv'][thisRoomStatus['pointer']-1];

    thisRoomStatus['trial']++; // the position in the gameRound
    thisRoomStatus['pointer']++; // the position in enture data
    thisRoomStatus['groupTotalPayoff'][thisRoomStatus['pointer']-1] = 0 // initialising the total payoff tracker

    // take note the current env
    if (thisRoomStatus['taskOrder'][thisRoomStatus['gameRound']] == 'dynamic') {
        if (thisRoomStatus['trial'] >= config.changes[thisRoomStatus['envChangeTracker']]) {
            thisRoomStatus['currentEnv']++;
            thisRoomStatus['envChangeTracker']++;
            console.log(' - Env changes to '+ (thisRoomStatus['currentEnv']) +' starts in '+ thisRoomName);
        }
    } else {
        thisRoomStatus['currentEnv'] = 0; // it's always 0 for static
    }

    if(thisRoomStatus['trial'] <= thisRoomStatus['horizon']) {
        // change the room's stage
        thisRoomStatus.stage = 'mainTask';
        io.to(thisRoomName).emit('Proceed to next trial', thisRoomStatus);
        console.log(' - New trial '+ (thisRoomStatus['trial']) +' starts in '+ thisRoomName);
    } else {
        // change the room's stage
        thisRoomStatus.stage = 'instruction';
        // update the room status
        thisRoomStatus['gameRound']++; // move to the next round
        thisRoomStatus['trial'] = 1; // resetting the trial num
        thisRoomStatus['currentEnv'] = 0; // resetting the environment num
        if (thisRoomStatus['taskOrder'][thisRoomStatus['gameRound']] == 'dynamic') {
            thisRoomStatus['horizon'] = config.horizonList[1]
        } else {
            thisRoomStatus['horizon'] = config.horizonList[0]
        }
        // announcing ending the round
        io.to(thisRoomName).emit('End this session', thisRoomStatus);
        console.log(' - End this round '+ (thisRoomStatus['gameRound']) +' in '+ thisRoomName);
    }
    
}

function startWaitingStageClock (room, countDown) {
    console.log(' - Waiting room opened at '+ room);
    countDown(room);
}

function stopAndResetClock (config, thisRoomName, countDownWaiting) {
    clearTimeout(countDownWaiting[thisRoomName]);
    config.roomStatus[thisRoomName]['restTime'] =  config.maxWaitingTime;
}


// function generating a Gaussien random variable
function BoxMuller(m, sigma) {
    let a = 1 - Math.random();
    let b = 1 - Math.random();
    let c = Math.sqrt(-2 * Math.log(a));
    if(0.5 - Math.random() > 0) {
        return c * Math.sin(Math.PI * 2 * b) * sigma + m;
    }else{
        return c * Math.cos(Math.PI * 2 * b) * sigma + m;
    }
};



// worker_thread
function createWorker(path, wd, id) {
    const w = new Worker(path, {workerData: wd});

    w.on('error', (err) => {
        console.error(`Worker ${w.workerData} error`)
        console.error(err);
    });

    w.on('exit', (exitCode) => {
        let exitlogtxt = ` - exitted! : ${id}`;
        console.log(exitlogtxt);
    });

    w.on('message', (msg) => {
        let messagelogtxt = ` - [Main] Message got from worker ${msg}`;
        // workerスレッドから送信されたメッセージ
        console.log(messagelogtxt);
    });
    return w;
}

function addNoise(scale) {
	let payoff_noise = Math.floor(Math.random() * scale);
	return payoff_noise;
}

function addSubject(config, client) {
    config.roomStatus[client.room]['n']++;
    config.roomStatus[client.room]['total_n']++;
    config.roomStatus[client.room]['membersID'].push(client.session);
	// Assigning an ID number within the room
    client.subNumCounter = 1;
    while (typeof client.subjectNumber === 'undefined') {
        if (config.roomStatus[client.room]['subjectNumbers'].indexOf(client.subNumCounter) === -1) {
            config.roomStatus[client.room]['subjectNumbers'].push(client.subNumCounter);
            client.subjectNumber = client.subNumCounter;
        } else {
            client.subNumCounter++;
        }
    }
}

module.exports = {
    addSubject
    , makeid
    , weightedRand2
    , indexOfMax
    , createArray
    , getRandomIntInclusive
    , shuffle
    , createRoomStatus
    , rand
    , proceedToResult
    , proceedTrial
    , startWaitingStageClock
    , stopAndResetClock
    , BoxMuller
    , createWorker
    , addNoise
}