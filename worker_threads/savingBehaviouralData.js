const {parentPort, workerData, isMainThread, threadId} = require('worker_threads');

// ==========================
const mongoose = require('mongoose');
const dbName = 'mongodb://127.0.0.1:27017/twoArmedTask2020';
// defining a model
const Behaviour = require('../models/behaviouralData');

mongoose.connect(dbName, {useNewUrlParser: true, useUnifiedTopology: true}, (err, db) => {
  let mongoConnectTime = new Date(),
      mongoConnectlogtxt = '[' + mongoConnectTime.getUTCFullYear() + '/' + (mongoConnectTime.getUTCMonth() + 1) + '/';
      mongoConnectlogtxt += mongoConnectTime.getUTCDate() + '/' + mongoConnectTime.getUTCHours() + ':' + mongoConnectTime.getUTCMinutes() + ':' + mongoConnectTime.getUTCSeconds() + ']';
      mongoConnectlogtxt += ` - Connected successfully to server (worker: ${workerData.amazonID})`;
  console.log(mongoConnectlogtxt);
});

// save each data to mongodb
let behaviour = new Behaviour();
behaviour.date = workerData.date;
behaviour.time = workerData.time;
behaviour.exp_condition = workerData.exp_condition;
behaviour.isLeftRisky = workerData.isLeftRisky;
behaviour.indivOrGroup = workerData.indivOrGroup;
behaviour.groupSize = workerData.groupSize;
behaviour.room = workerData.room;
behaviour.confirmationID = workerData.confirmationID;
behaviour.subjectNumber = workerData.subjectNumber;
behaviour.amazonID = workerData.amazonID;
//behaviour.payoffLandscape = workerData.payoffLandscape;
behaviour.round = workerData.round;
behaviour.choice = workerData.choice;
behaviour.payoff = workerData.payoff;
behaviour.totalEarning = workerData.totalEarning;
behaviour.behaviouralType = workerData.behaviouralType;
behaviour.timeElapsed = workerData.timeElapsed;
behaviour.latency = workerData.latency;
//behaviour.socialFreq_safe = workerData.socialFreq[0];
//behaviour.socialFreq_risky = workerData.socialFreq[1];
behaviour.socialFreq_safe1 = workerData.socialFreq[workerData.optionOrder[0] - 1];
behaviour.socialFreq_safe2 = workerData.socialFreq[workerData.optionOrder[1] - 1];
behaviour.socialFreq_safe3 = workerData.socialFreq[workerData.optionOrder[2] - 1];
behaviour.socialFreq_risky = workerData.socialFreq[workerData.optionOrder[3] - 1];
behaviour.riskDistributionId = workerData.riskDistributionId;


let dummyInfo0 = new Array(workerData.maxGroupSize).fill(-1);

for(let j=0; j<workerData.maxGroupSize; j++) {
  if (j < 10) {
    eval('behaviour.socialInfo_0'+j+'= dummyInfo0['+j+'];');
    eval('behaviour.publicInfo_0'+j+'= dummyInfo0['+j+'];');
  } else {
    eval('behaviour.socialInfo_'+j+'= dummyInfo0['+j+'];');
    eval('behaviour.publicInfo_'+j+'= dummyInfo0['+j+'];');
  }
}

if(behaviour.round>1){
  if(typeof workerData.socialInfo != 'undefined') { 
    for(let j = 0; j < workerData.socialInfo.length; j++) {
      if ( j < 10) {
        eval('behaviour.socialInfo_0'+j+'= workerData.socialInfo['+j+'];');
        eval('behaviour.publicInfo_0'+j+'= workerData.publicInfo['+j+'];');
      } else {
        eval('behaviour.socialInfo_'+j+'= workerData.socialInfo['+j+'];');
        eval('behaviour.publicInfo_'+j+'= workerData.publicInfo['+j+'];');
      }
    }
  }else{
    console.log(` - [Worker] workerData.socialInfo is undefined!`);
  }
}

behaviour.save(function(err){
  if(err) console.log(`err at worker ${workerData.amazonID}.`);
  let now = new Date()
        , logdate = '[' + now.getUTCFullYear() + '/' + (now.getUTCMonth() + 1) + '/'
      ;
  logdate += now.getUTCDate() + '/' + now.getUTCHours() + ':' + now.getUTCMinutes() + ':' + now.getUTCSeconds() + ']';
  console.log(logdate + ` - [Worker] isMainThread: ${isMainThread}, behaviour of ${workerData.confirmationID} saved`);
  process.exit();
});

parentPort.postMessage(`[Worker] Finished ${workerData.amazonID}`)
