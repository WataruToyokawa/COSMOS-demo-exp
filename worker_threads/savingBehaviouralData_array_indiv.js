const {parentPort, workerData, isMainThread, threadId} = require('worker_threads');

// ==========================
const mongoose = require('mongoose');
const dbName = 'mongodb://127.0.0.1:27017/twoArmedTask2020';
// defining a model
const Behaviour = require('../models/behaviouralData_indiv');

mongoose.connect(dbName, {useNewUrlParser: true, useUnifiedTopology: true}, (err, db) => {
  let mongoConnectTime = new Date(),
      mongoConnectlogtxt = '[' + mongoConnectTime.getUTCFullYear() + '/' + (mongoConnectTime.getUTCMonth() + 1) + '/';
      mongoConnectlogtxt += mongoConnectTime.getUTCDate() + '/' + mongoConnectTime.getUTCHours() + ':' + mongoConnectTime.getUTCMinutes() + ':' + mongoConnectTime.getUTCSeconds() + ']';
      if(typeof workerData[0] != 'undefined') {
        mongoConnectlogtxt += ` - Connected successfully to server (room: ${workerData[0].room})`;
      } else {
        mongoConnectlogtxt += ` - Connected successfully to server (room: undefined)`;
      }
  console.log(mongoConnectlogtxt);
});

console.log('worker data length is ' + workerData.length);

for (let i = 0; i < workerData.length; i++) {
  let this_workerData = workerData[i];
  //console.log('this workerData\'s optionOder is: '+this_workerData.optionOrder);
  let behaviour = new Behaviour();
  behaviour.date = this_workerData.date;
  behaviour.time = this_workerData.time;
  behaviour.exp_condition = this_workerData.exp_condition;
  behaviour.isLeftRisky = this_workerData.isLeftRisky;
  behaviour.indivOrGroup = this_workerData.indivOrGroup;
  behaviour.groupSize = this_workerData.groupSize;
  behaviour.room = this_workerData.room;
  behaviour.confirmationID = this_workerData.confirmationID;
  behaviour.subjectNumber = this_workerData.subjectNumber;
  behaviour.amazonID = this_workerData.amazonID;
  behaviour.round = this_workerData.round;
  behaviour.choice = this_workerData.choice;
  behaviour.payoff = this_workerData.payoff;
  behaviour.totalEarning = this_workerData.totalEarning;
  behaviour.behaviouralType = this_workerData.behaviouralType;
  behaviour.timeElapsed = this_workerData.timeElapsed;
  behaviour.latency = this_workerData.latency;
  behaviour.socialFreq_safe1 = 0;
  behaviour.socialFreq_safe2 = 0;
  behaviour.socialFreq_safe3 = 0;
  behaviour.socialFreq_risky = 0;
  behaviour.riskDistributionId = this_workerData.riskDistributionId;

  // let dummyInfo0 = new Array(this_workerData.maxGroupSize).fill(-1);

  // for(let j=0; j<this_workerData.maxGroupSize; j++) {
  //   if (j < 10) {
  //     eval('behaviour.socialInfo_0'+j+'= dummyInfo0['+j+'];');
  //     eval('behaviour.publicInfo_0'+j+'= dummyInfo0['+j+'];');
  //   } else {
  //     eval('behaviour.socialInfo_'+j+'= dummyInfo0['+j+'];');
  //     eval('behaviour.publicInfo_'+j+'= dummyInfo0['+j+'];');
  //   }
  // }

  // if(behaviour.round>1){
  //   if(typeof this_workerData.socialInfo != 'undefined') { 
  //     for(let j = 0; j < this_workerData.socialInfo.length; j++) {
  //       if ( j < 10) {
  //         eval('behaviour.socialInfo_0'+j+'= this_workerData.socialInfo['+j+'];');
  //         eval('behaviour.publicInfo_0'+j+'= this_workerData.publicInfo['+j+'];');
  //       } else {
  //         eval('behaviour.socialInfo_'+j+'= this_workerData.socialInfo['+j+'];');
  //         eval('behaviour.publicInfo_'+j+'= this_workerData.publicInfo['+j+'];');
  //       }
  //     }
  //   }else{
  //     console.log(` - [Worker] this_workerData.socialInfo is undefined!`);
  //   }
  // }

  behaviour.save(function(err){
    if(err) console.log(`err at worker ${this_workerData.amazonID}.`);
    if(i == workerData.length - 1) {
      let now = new Date()
            , logdate = '[' + now.getUTCFullYear() + '/' + (now.getUTCMonth() + 1) + '/'
          ;
      logdate += now.getUTCDate() + '/' + now.getUTCHours() + ':' + now.getUTCMinutes() + ':' + now.getUTCSeconds() + ']';
      console.log(logdate + ` - [Worker] isMainThread: ${isMainThread}, behaviour of ${this_workerData.room} saved`);
      process.exit();
      parentPort.postMessage(`[Worker] Finished ${this_workerData.room}`)
    }
  });
}

