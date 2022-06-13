const {parentPort, workerData, isMainThread, threadId} = require('worker_threads');

// ==========================
const mongoose = require('mongoose');
const dbName = 'mongodb://127.0.0.1:27017/twoArmedTask2020';
// defining a model
const Behaviour = require('../models/behaviouralData');

mongoose.connect(dbName, {useNewUrlParser: true, useUnifiedTopology: true}, (err, db) => {
  console.log(`Connected successfully to server (worker: ${workerData[0].room})`);
});

// Array including each participant's data 
let behaviour = new Array(workerData.length);
let totalSaved = 0;

console.log(`[Worker] workerData.length is ${workerData.length}`) // it works

// save each data to mongodb
for(let i=0; i<workerData.length; i++) {
  behaviour[i] = new Behaviour();
  behaviour[i].date = workerData[i].date;
  behaviour[i].time = workerData[i].time;
  behaviour[i].exp_condition = workerData[i].exp_condition;
  behaviour[i].indivOrGroup = workerData[i].indivOrGroup;
  behaviour[i].groupSize = workerData[i].groupSize;
  behaviour[i].room = workerData[i].room;
  behaviour[i].confirmationID = workerData[i].confirmationID;
  behaviour[i].subjectNumber = workerData[i].subjectNumber;
  behaviour[i].amazonID = workerData[i].amazonID;
  behaviour[i].payoffLandscape = workerData[i].payoffLandscape;
  behaviour[i].round = workerData[i].round;
  behaviour[i].choice = workerData[i].choice;
  behaviour[i].payoff = workerData[i].payoff;
  behaviour[i].totalEarning = workerData[i].totalEarning;
  behaviour[i].behaviouralType = workerData[i].behaviouralType;
  behaviour[i].timeElapsed = workerData[i].timeElapsed;
  behaviour[i].latency = workerData[i].latency;
  behaviour[i].socialFreq_safe = workerData[i].socialFreq[0];
  behaviour[i].socialFreq_risky = workerData[i].socialFreq[0];

  let dummyInfo0 = new Array(workerData[i].maxGroupSize).fill(-1);

  for(let j=0; j<workerData[i].maxGroupSize; j++) {
    eval('behaviour['+i+'].socialInfo_'+j+'= dummyInfo0['+j+'];');
    eval('behaviour['+i+'].publicInfo_'+j+'= dummyInfo0['+j+'];');
  }

  if(behaviour[i].round>1){
    for(let j = 0; j < workerData[i].socialInfo.length; j++) {
      eval('behaviour['+i+'].socialInfo_'+j+'= workerData['+i+'].socialInfo['+j+'];');
      eval('behaviour['+i+'].publicInfo_'+j+'= workerData['+i+'].publicInfo['+j+'];');
    }
  }

  behaviour[i].save(function(err, doc, num){
    if(err) {
      console.log(`err at worker ${workerData[i].confirmationID}.`);
    } else {
      console.log(typeof num);
      console.log(`[Worker] isMainThread: ${isMainThread}, behaviour of ${workerData[i].confirmationID} saved`);
      if(i == workerData.length-1){
        process.exit();
      }
    }
  });

  //console.log(`loop number `+ i);

}

parentPort.postMessage(`[Worker] Finished ${workerData.amazonID}`)
