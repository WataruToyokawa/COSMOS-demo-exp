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
      mongoConnectlogtxt += ` - Connected successfully to server (worker: ${workerData.amazonID})`;
  console.log(`Connected successfully to server (worker: ${workerData.amazonID})`);
});

// save each data to mongodb
let behaviour = new Behaviour();
behaviour.date = workerData.date;
behaviour.time = workerData.time;
behaviour.exp_condition = workerData.exp_condition;
behaviour.isLeftRisky = workerData.isLeftRisky;
behaviour.indivOrGroup = workerData.indivOrGroup;
behaviour.groupSize = 1;
behaviour.room = workerData.room;
behaviour.confirmationID = workerData.confirmationID;
behaviour.subjectNumber = 1;
behaviour.amazonID = workerData.amazonID;
behaviour.round = workerData.round;
behaviour.choice = workerData.choice;
behaviour.payoff = workerData.payoff;
behaviour.totalEarning = workerData.totalEarning;
behaviour.behaviouralType = workerData.behaviouralType;
behaviour.timeElapsed = -1;
behaviour.latency = workerData.latency;
//behaviour.socialFreq_safe = workerData.socialFreq[0];
//behaviour.socialFreq_risky = workerData.socialFreq[1];
behaviour.socialFreq_safe1 = 0;
behaviour.socialFreq_safe2 = 0;
behaviour.socialFreq_safe3 = 0;
behaviour.socialFreq_risky = 0;
behaviour.riskDistributionId = workerData.riskDistributionId;


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
