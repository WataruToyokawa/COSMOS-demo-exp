/*===============================================================
// Multi-argent two-armed bandit task
// Author: Wataru Toyokawa
// Date: 3 November 2020
// Collaborating with Professor Wolfgang Gaissmaier
//
// Updated features from gameServer_4ab.js
// 	  * Saving the behavioural file only when the task is completed 
          (or when the final remaining subject left the room)
      * It can handle either 2- or 4-armed bandit
// Requirements:
//    * Node.js
//    * node_modules: express, socket.io, fast-csv, php-express
//    * mongoDB and mongoose
// ============================================================== */

// Loading modules
const express = require('express')
,	app = express()
,	cors = require('cors')
,	server = require('http').Server(app)
,	io = require('socket.io')(server, {
	// below are engine.IO options
	pingInterval: 20000, // how many ms before sending a new ping packet
	pingTimeout: 50000 // how many ms without a pong packet to consider the connection closed
	})
,	bodyParser = require("body-parser")
,	portnum = 8080
;

// multi-threading like thing in Node.js
const {Worker} = require('node:worker_threads');


// Experimental variables
const horizon = 10 // 100?
, sessionNo = 400 // 0 = debug; 100~ = 30&31 July; 200~ = August; 300~ afternoon August; 400~ revision exp
, maxGroupSize = 30 //
, minGroupSize = 2 //4
, maxWaitingTime = 40*1000 //3*60*1000
, num_cell = 4
, numOptions = num_cell * num_cell // 
, maxChoiceStageTime = 15*1000 //20*1000 // ms
, maxTimeTestScene = 4* 60*1000 // 4*60*1000
, options = [];
;


for (let i = 1; i <= numOptions; i++) {
   options.push(i);
}

// date and time
let myD = new Date()
, myMonth = myD.getMonth() + 1
, myDate = myD.getUTCDate()
, myHour = myD.getUTCHours()
, myMin = myD.getUTCMinutes()
;
if(myMonth<10){myMonth = '0'+myMonth;}
if(myDate<10){myDate = '0'+myDate;}
if(myHour<10){myHour = '0'+myHour;}
if(myMin<10){myMin = '0'+myMin;}

// experimental server
const firstRoomName = makeid(7) + '_session_' + sessionNo
,	roomStatus = {}
, sessionNameSpace = {};
// experimental status
let total_N_now = 0
, countDownMainStage = {}
, countDownWaiting = {}
, firstTrialStartingTime // this is to compensate time spent in the task
;
countDownMainStage[firstRoomName] = new Object();
countDownWaiting[firstRoomName] = new Object();

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors({ origin: ['http://63-250-60-135.cloud-xip.io:8080','http://63.250.60.135:8080'], credentials: true })); // origin: true

// Routings
const gameRouter = require('./routes/game'); // loading game.ejs from which amazonID is transferred
// Assigning routers to Routing
app.use('/', gameRouter);

// error handling
app.use((err, req, res, next) => {
    console.error(err.stack)
    res.status(500).send('A technical issue happened in the server...😫')
});

// GC for every 10 seconds
setInterval(function generateHeapDumpAndStats() {
	// 1. garbage collection
	try {
		if (global.gc) {global.gc();}
	} catch (e) {
		console.log("Use this command to execute: 'node --expose-gc THIS_APP_NAME.js");
		process.exit();
	}
	// // 2.Output the memory use
	// const heapUsed = process.memoryUsage().heapUsed;
	// console.log(heapUsed + " bites consumed")
}, 10000);

roomStatus['finishedRoom'] = {
    exp_condition: 'finishedRoom',
    optionOrder: shuffle(options),
    // optionOrder: [],
    indivOrGroup: -1,
    n: 0,
    membersID: [],
    subjectNumbers: [],
    disconnectedList: [],
    testPassed: 0,
    starting: 0,
    stage: 'firstWaiting',
    maxChoiceStageTime: maxChoiceStageTime,
    choiceTime: [],
    round: 1,
    doneId: createArray(horizon, 0),
    doneNo: Array(horizon).fill(0),
    socialFreq: Array(horizon),
    socialInfo: createArray(horizon, maxGroupSize),
    publicInfo: createArray(horizon, maxGroupSize),
    choiceOrder: createArray(horizon, maxGroupSize),
    date: createArray(horizon, maxGroupSize),
    time: createArray(horizon, maxGroupSize),
    timeSec: createArray(horizon, maxGroupSize),
    saveDataThisRound: [],
    restTime:maxWaitingTime,
};
// The following is the first room
// Therefore, Object.keys(roomStatus).length = 2 right now
// A new room will be open once this room becomes full
roomStatus[firstRoomName] = {
    exp_condition: '', //bandit_profile[weightedRand2({0:prob_binary, 1:(1-prob_binary)})],
    optionOrder: shuffle(options),
    // optionOrder: [],
    indivOrGroup: -1,
    n: 0,
    membersID: [],
    subjectNumbers: [],
    disconnectedList: [],
    testPassed: 0,
    starting: 0,
    stage: 'firstWaiting',
    maxChoiceStageTime: maxChoiceStageTime,
    choiceTime: [],
    round: 1,
    doneId: createArray(horizon, 0),
    doneNo: Array(horizon).fill(0),
    socialFreq: Array(horizon),
    socialInfo:createArray(horizon, maxGroupSize),
    publicInfo:createArray(horizon, maxGroupSize),
    choiceOrder:createArray(horizon, maxGroupSize),
	date: createArray(horizon, maxGroupSize),
    time: createArray(horizon, maxGroupSize),
    timeSec: createArray(horizon, maxGroupSize),
    saveDataThisRound: [],
    restTime:maxWaitingTime
};

/**
 * Letting the server listen the port
 */
const port = process.env.PORT || portnum;

server.listen(port, function() {
	let now = new Date(),
	  logtxt = '[' + now.getUTCFullYear() + '/' + (now.getUTCMonth() + 1) + '/';
	logtxt += now.getUTCDate() + '/' + now.getUTCHours() + ':' + now.getUTCMinutes() + ':' + now.getUTCSeconds() + ']';
	logtxt += ' - ' + numOptions + '-armed bandit task server listening on port ' + port + '; max_n_per_rooom = '+maxGroupSize;
	console.log(logtxt);
});

/**
 * Socket.IO Connection.
 * The following code will be executed when the 'connection' is esablished between this server and the client 
 */
io.on('connection', function (client) {
	// client's unique identifier 
	client.amazonID = client.request._query.amazonID;
	client.condition = client.request._query.condition;
	client.started = 0;
	// client.condition = client.request._query.condition;
	// console.log('client.request._query.amazon = '+ client.request._query.amazonID);
	// console.log('client.request._query.condition = '+ client.request._query.condition);

	// Assigning "client.session" as an unique identifier of the participant
	// If the client already has the sessionName, 
	// put this client into a experimental room
	if (typeof client.request._query.sessionName == 'undefined') {
		// client.sessionName: this is an unique code for each participant
		client.session = client.id;
		client.join(client.session);
		sessionNameSpace[client.session] = 1;
		let now = new Date()
		,	logtxt = '[' + now.getUTCFullYear() + '/' + (now.getUTCMonth() + 1) + '/'
		;
		logtxt += now.getUTCDate() + '/' + now.getUTCHours() + ':' + now.getUTCMinutes() + ':' + now.getUTCSeconds() + ']';
		logtxt += '- sessionName was just assigned to '+ client.session + ' (condition = ' + client.condition + ')';
		console.log(logtxt);

	} else if (client.request._query.sessionName == 'already_finished'){
		// Some web browsers may try to reconnect with this game server when the browser
		// is forced to disconnect. The following script will assure 
		// that such reconnected subject will not go to a normal room, 
		// but to the 'finishedRoom' where nothing will ever never happen.
		client.session = client.request._query.sessionName;
		client.room = 'finishedRoom';
		client.join(client.session);
		client.join(client.room);
		console.log('sessionName was aldeary_finished');

	} else {
		// When client comes back from a short disconnection
		client.session = client.request._query.sessionName;
		client.room = client.request._query.roomName;
		client.join(client.session);
		client.join(client.room);
		io.to(client.session).emit('S_to_C_welcomeback', {sessionName: client.session, roomName: client.room});
		total_N_now++;
		sessionNameSpace[client.session] == 1;
		var now = new Date(),
			logdate = '['+now.getUTCFullYear()+'/'+(now.getUTCMonth()+1)+'/';
		logdate += now.getUTCDate()+'/'+now.getUTCHours()+':'+now.getUTCMinutes()+':'+now.getUTCSeconds()+']';
		console.log(logdate+' - '+ client.session +' ('+client.amazonID+') in room '+client.room+' reconnected to the server');

		if(typeof roomStatus[client.room] == 'undefined'){
			roomStatus[client.room] = {
				exp_condition: '', //bandit_profile[weightedRand2({0:prob_binary, 1:(1-prob_binary)})],
				optionOrder: shuffle(options),
				// optionOrder: [],
				indivOrGroup: -1,
				n: 0,
				membersID: [],
				subjectNumbers: [],
				disconnectedList: [],
				testPassed: 0,
				starting: 0,
				stage: 'resuming',
				maxChoiceStageTime: maxChoiceStageTime,
				choiceTime: [],
				round: 1,
				doneId: createArray(horizon, 0),
				doneNo: Array(horizon).fill(0),
				socialFreq: Array(horizon),
				socialInfo:createArray(horizon, maxGroupSize),
				publicInfo:createArray(horizon, maxGroupSize),
				choiceOrder:createArray(horizon, maxGroupSize),
				date: createArray(horizon, maxGroupSize),
				time: createArray(horizon, maxGroupSize),
				timeSec: createArray(horizon, maxGroupSize),
				saveDataThisRound: [],
				restTime:maxWaitingTime
			};
			roomStatus[client.room]['n']++;
			roomStatus[client.room]['total_n']++;
			roomStatus[client.room]['membersID'].push(client.session);
			// Assigning an ID number within the room
			client.subNumCounter = 1;
			while (typeof client.subjectNumber == 'undefined') {
				if (roomStatus[client.room]['subjectNumbers'].indexOf(client.subNumCounter) == -1) {
					roomStatus[client.room]['subjectNumbers'].push(client.subNumCounter);
				  	client.subjectNumber = client.subNumCounter;
				} else {
				  	client.subNumCounter++;
				}
			}
		} else if (roomStatus[client.room]['starting'] > 0) {
			io.to(client.session).emit('you guys are individual condition');
		} else {
			roomStatus[client.room]['n']++;
			roomStatus[client.room]['total_n']++;
			roomStatus[client.room]['membersID'].push(client.session);
			// Assigning an ID number within the room
			client.subNumCounter = 1;
			while (typeof client.subjectNumber == 'undefined') {
				if (roomStatus[client.room]['subjectNumbers'].indexOf(client.subNumCounter) == -1) {
					roomStatus[client.room]['subjectNumbers'].push(client.subNumCounter);
				  	client.subjectNumber = client.subNumCounter;
				} else {
				  	client.subNumCounter++;
				}
			}
		}
	}

	// When client's game window is ready & latency was calculated
	client.on('core is ready', function(data) {
		if (client.started == 0) {
			client.started = 1
			// Time stamp
			let now_coreReady = new Date();
		    let logtext_coreReady = '['+now_coreReady.getUTCFullYear()+'/'+(now_coreReady.getUTCMonth()+1)+'/';
		    logtext_coreReady += now_coreReady.getUTCDate()+'/'+now_coreReady.getUTCHours()+':'+now_coreReady.getUTCMinutes()+':'+now_coreReady.getUTCSeconds()+']';
		    logtext_coreReady += ' - Client: ' + client.session +'('+client.amazonID+') responds with an average latency = '+ data.latency + ' ms.';
		    client.latency = data.latency; 
		    console.log(logtext_coreReady);
		    // if(data.latency < data.maxLatencyForGroupCondition) {
			console.log('client.condition = ' + client.condition)
			if(client.condition == 'group' | client.condition == 'competitive') {
		    	// Let the client join the newest room
			  	client.roomFindingCounter = 1; // default: roomStatus = {'finishedRoom', 'session_100'}
			  	while (typeof client.room == 'undefined') {
				    // if there are still rooms to check
				    if (client.roomFindingCounter <= Object.keys(roomStatus).length - 1) {
						if(roomStatus[Object.keys(roomStatus)[client.roomFindingCounter]]['starting'] == 0 && roomStatus[Object.keys(roomStatus)[client.roomFindingCounter]]['n'] < maxGroupSize && roomStatus[Object.keys(roomStatus)[client.roomFindingCounter]]['restTime'] > 999 && roomStatus[Object.keys(roomStatus)[client.roomFindingCounter]]['exp_condition'] == client.condition) {
							client.room = Object.keys(roomStatus)[client.roomFindingCounter];
							var now_joined1 = new Date();
							var logdate_joined1 = '['+now_joined1.getUTCFullYear()+'/'+(now_joined1.getUTCMonth()+1)+'/';
							logdate_joined1 += now_joined1.getUTCDate()+'/'+now_joined1.getUTCHours()+':'+now_joined1.getUTCMinutes()+':'+now_joined1.getUTCSeconds()+']';
							console.log(logdate_joined1+' - '+ client.session +'('+client.amazonID+')'+' joined to '+ client.room +' (n: '+(1+roomStatus[client.room]['n'])+', total N: '+(1+total_N_now)+') with condition = '+ client.condition);
						} else {
							client.roomFindingCounter++;
						}
				    } else {
				      // else if there is no more available room left
				      // Make a new room
				      // client.newRoomName = myMonth+myDate+myHour+myMin+'_session_' + (sessionNo + Object.keys(roomStatus).length - 1);
				      client.newRoomName = makeid(7) + '_session_' + (sessionNo + Object.keys(roomStatus).length - 1);
				      roomStatus[client.newRoomName] = 
				      {
				          exp_condition: client.condition, //bandit_profile[weightedRand2({0:prob_binary, 1:(1-prob_binary)})],
				          // riskDistributionId: 20, //getRandomIntInclusive(max = 13, min = 13), // max = 2, min = 0
				          // isLeftRisky: isLeftRisky_list[getRandomIntInclusive(max = 1, min = 0)],
				          optionOrder: shuffle(options),
				          // optionOrder: [],
				          indivOrGroup: -1,
				          n: 0,
				          membersID: [],
				          subjectNumbers: [],
				          disconnectedList: [],
				          testPassed: 0,
				          starting: 0,
				          stage: 'firstWaiting',
				          maxChoiceStageTime: maxChoiceStageTime,
				          choiceTime: [],
				          round: 1,
				          doneId: createArray(horizon, 0),
				          doneNo: Array(horizon).fill(0),
				          socialFreq: Array(horizon),
				          socialInfo:createArray(horizon, maxGroupSize),
				          publicInfo:createArray(horizon, maxGroupSize),
				          choiceOrder:createArray(horizon, maxGroupSize),
						  date: createArray(horizon, maxGroupSize),
						  time: createArray(horizon, maxGroupSize),
						  timeSec: createArray(horizon, maxGroupSize),
				          saveDataThisRound: [],
				          restTime:maxWaitingTime
				      };
				      // Register the client to the new room
				      client.room = client.newRoomName;
				      let now_joined2 = new Date();
				      let logdate_joined2 = '['+now_joined2.getUTCFullYear()+'/'+(now_joined2.getUTCMonth()+1)+'/';
				      logdate_joined2 += now_joined2.getUTCDate()+'/'+now_joined2.getUTCHours()+':'+now_joined2.getUTCMinutes()+':'+now_joined2.getUTCSeconds()+']';
				      console.log(logdate_joined2+' - '+ client.session +'('+client.amazonID+')'+' joined to '+ client.room +' (n: '+(1+roomStatus[client.room]['n'])+', total N: '+(1+total_N_now)+') with condition = ' + client.condition);
				      // Make a clock object in the new room
				      countDownMainStage[client.room] = new Object();
				      countDownWaiting[client.room] = new Object();
				    }
			  	}
			  
				// Let the client join and know the registered room
				client.join(client.room);
				//io.to(client).emit('S_to_C_clientSessionName', {sessionName: client.session, roomName: client.room});

				total_N_now++;
				roomStatus[client.room]['n']++
				roomStatus[client.room]['membersID'].push(client.session);
				// Assigning an ID number within the room
				client.subNumCounter = 1;
				while (typeof client.subjectNumber == 'undefined') {
					if (roomStatus[client.room]['subjectNumbers'].indexOf(client.subNumCounter) == -1) {
						roomStatus[client.room]['subjectNumbers'].push(client.subNumCounter);
					  	client.subjectNumber = client.subNumCounter;
					} else {
					  	client.subNumCounter++;
					}
				}
				// Let the client know the specific task's parameters
				parameterEmitting(client);
		    } else {
		    	// else if client.condition == individual
		      	// then this subject is go to the individual condition
		      	// client.newRoomName = myMonth+myDate+myHour+myMin+'_largeLatency_' + (sessionNo + Object.keys(roomStatus).length - 1);
				client.newRoomName = myMonth+myDate+myHour+myMin+'_indiv_' + (sessionNo + Object.keys(roomStatus).length - 1);
				roomStatus[client.newRoomName] = 
		      	{
					exp_condition: 'individual', //bandit_profile[weightedRand2({0:prob_binary, 1:(1-prob_binary)})],
					// riskDistributionId: 20, //getRandomIntInclusive(max = 13, min = 13), // max = 2, min = 0
					// isLeftRisky: isLeftRisky_list[getRandomIntInclusive(max = 1, min = 0)],
					optionOrder: shuffle(options),
					// optionOrder: [],
					indivOrGroup: 0,
					n: 0,
					membersID: [],
					subjectNumbers: [],
					disconnectedList: [],
					testPassed: 0,
					starting: 0,
					stage: 'firstWaiting',
					maxChoiceStageTime: maxChoiceStageTime,
					choiceTime: [],
					round: 1,
					doneId: createArray(horizon, 0),
					doneNo: Array(horizon).fill(0),
					socialFreq: Array(horizon),
					socialInfo:createArray(horizon, maxGroupSize),
					publicInfo:createArray(horizon, maxGroupSize),
					choiceOrder:createArray(horizon, maxGroupSize),
					date: createArray(horizon, maxGroupSize),
					time: createArray(horizon, maxGroupSize),
					timeSec: createArray(horizon, maxGroupSize),
					saveDataThisRound: [],
					restTime:1000
		      	};
				// Register the client to the new room
				client.room = client.newRoomName;
				var now_joined3 = new Date();
				var logdate_joined3 = '['+now_joined3.getUTCFullYear()+'/'+(now_joined3.getUTCMonth()+1)+'/';
				logdate_joined3 += now_joined3.getUTCDate()+'/'+now_joined3.getUTCHours()+':'+now_joined3.getUTCMinutes()+':'+now_joined3.getUTCSeconds()+']';
				console.log(logdate_joined3+' - '+ client.session +'('+client.amazonID+')'+' joined to '+ client.room +' (n: '+(1+roomStatus[client.room]['n'])+', total N: '+(1+total_N_now)+') with condition = ' + client.condition);
				// Let the client join the registered room
				client.join(client.room);
				//io.to(client).emit('S_to_C_clientSessionName', {sessionName: client.session, roomName: client.room});
				client.subjectNumber = 1;
				total_N_now++;
				roomStatus[client.room]['n']++
				roomStatus[client.room]['membersID'].push(client.session);
				// Let the client know the specific task's parameters
				parameterEmitting(client);
		    }
		    if(client.room != 'finishedRoom') {
		    	// Let client wait until start flag turns 1
		      	// the clock for the waiting room starts when the first client pops in.
				if (roomStatus[client.room]['n']===1) {
					let now_1stIndiv = new Date(),
					    logdate_1stIndiv = '[' + now_1stIndiv.getUTCFullYear() + '/' + (now_1stIndiv.getUTCMonth() + 1) + '/';
					logdate_1stIndiv += now_1stIndiv.getUTCDate() + '/' + now_1stIndiv.getUTCHours() + ':' + now_1stIndiv.getUTCMinutes() + ':' + now_1stIndiv.getUTCSeconds() + ']';
					console.log(logdate_1stIndiv + ' - The first participant came in to the room ' + client.room + '.');
					startWaitingStageClock(client.room);
				}
				// inform rest time to the room
				io.to(client.room).emit('this is the remaining waiting time', {restTime:roomStatus[client.room]['restTime'], max:maxWaitingTime, maxGroupSize:maxGroupSize, horizon:horizon});
			}
		}
	});

	client.on('this is the previous restTime', function (data) {
		roomStatus[client.room]['restTime'] = data.restTime;
		if (roomStatus[client.room]['stage'] == 'resuming') {
			console.log(' - waiting clock was just resumed at ' + client.room + '.');
			startWaitingStageClock(client.room);
			roomStatus[client.room]['stage'] = 'firstWaiting';
		}
		// inform rest time to the room
		io.to(client.room).emit('this is the remaining waiting time', {restTime:roomStatus[client.room]['restTime'], max:maxWaitingTime, maxGroupSize:maxGroupSize, horizon:horizon});
	});

	// client.on('loading completed', function () {
	// 	console.log('loading completed received');
	// 	io.to(client.room).emit('this is the remaining waiting time', {restTime:roomStatus[client.room]['restTime'], max:maxWaitingTime, maxGroupSize:maxGroupSize, horizon:horizon});
	// });

	client.on('ok individual condition sounds good', function () {
		client.condition = 'individual';
		// finally checking weather group is still below the maxnumber
		if(roomStatus[client.room]['n'] < maxGroupSize) {
			// the status of the client's former room is updated
			roomStatus[client.room]['starting'] = 1;
			roomStatus[client.room]['n']--;
			// create a new individual condition's room
			roomStatus[myMonth+myDate+myHour+myMin+'_sessionIndiv_' + (sessionNo + Object.keys(roomStatus).length - 1)] = 
			{
				exp_condition: 'individual', //bandit_profile[weightedRand2({0:prob_binary, 1:(1-prob_binary)})],
				optionOrder: shuffle(options),
				// optionOrder: [],
				indivOrGroup: 0,
				n: 0,
				membersID: [],
				subjectNumbers: [],
				disconnectedList: [],
				testPassed: 0,
				starting: 0,
				stage: 'firstWaiting',
				maxChoiceStageTime: maxChoiceStageTime,
				choiceTime: [],
				round: 1,
				doneId: createArray(horizon, 0),
				doneNo: Array(horizon).fill(0),
				socialFreq: Array(horizon),
				socialInfo:createArray(horizon, maxGroupSize),
				publicInfo:createArray(horizon, maxGroupSize),
				choiceOrder:createArray(horizon, maxGroupSize),
				date: createArray(horizon, maxGroupSize),
				time: createArray(horizon, maxGroupSize),
				timeSec: createArray(horizon, maxGroupSize),
				saveDataThisRound: [],
				restTime:maxWaitingTime
			};
			// client leave the former room
			client.leave(client.room);
			// client joints the new individual room
			client.room = Object.keys(roomStatus)[Object.keys(roomStatus).length - 1];
			client.join(client.room);
			//total_N_now++;
			roomStatus[client.room]['n']++
			roomStatus[client.room]['membersID'].push(client.session);
			client.subjectNumber = roomStatus[client.room]['n'];
			startSession(client.room);
		} else {
			// if groupSize has reached the enough number
			startSession(client.room);
		}
	});

	client.on('test passed', function () {
		if (typeof roomStatus[client.room] != 'undefined') {
			if (roomStatus[client.room]['testPassed']==0) {
				roomStatus[client.room]['stage'] = 'secondWaitingRoom';
			}
			roomStatus[client.room]['testPassed']++;
			var now670 = new Date(),
				logdate670 = '['+now670.getUTCFullYear()+'/'+(now670.getUTCMonth()+1)+'/';
				logdate670 += now670.getUTCDate()+'/'+now670.getUTCHours()+':'+now670.getUTCMinutes()+':'+now670.getUTCSeconds()+'] ';
			console.log(logdate670 +' - '+ client.session + ' passed the test.');
			if (roomStatus[client.room]['testPassed'] >= roomStatus[client.room]['n']) {
				var now675 = new Date(),
				logdate675 = '['+now675.getUTCFullYear()+'/'+(now675.getUTCMonth()+1)+'/';
				logdate675 += now675.getUTCDate()+'/'+now675.getUTCHours()+':'+now675.getUTCMinutes()+':'+now675.getUTCSeconds()+']';
				console.log(logdate675 + ' - ' + client.room + ' is ready to start the game.');
				io.to(client.room).emit('all passed the test'
					, {n:roomStatus[client.room]['n']
					, testPassed:roomStatus[client.room]['testPassed']
					, exp_condition:roomStatus[client.room]['exp_condition']});
				firstTrialStartingTime = now675;
				roomStatus[client.room]['stage'] = 'mainTask';
			} else {
				io.to(client.session).emit('wait for others finishing test');
			}
		}
	});

	client.on('move_avatar', function (data) {
		io.to(client.room).emit('avatar_position_update'
		  		, {x:data.x
		  		, y:data.y
		  		, subjectNumber:client.subjectNumber
		  	});
	});

	client.on('play_arm', function(data) {
		let now = new Date()
        ,	logdate = '[' + now.getUTCFullYear() + '/' + (now.getUTCMonth() + 1) + '/'
    	;
    	logdate += now.getUTCDate() + '/' + now.getUTCHours() + ':' + now.getUTCMinutes() + ':' + now.getUTCSeconds() + ']';
    	console.log(logdate + ' - Client ' + client.session + ' (subNo = ' + client.subjectNumber + ') chose ' + data.box_quality + ' and got ' + data.payoff + ' at trial ' + data.this_trial_num + '.');
		let this_round_temp = data.this_trial_num //roomStatus[client.room]['round']
		,	this_subject_temp = client.subjectNumber
		;
		if (typeof this_subject_temp != 'undefined' & typeof client.room != 'undefined' & typeof roomStatus[client.room]['socialInfo'][this_round_temp - 1][this_subject_temp - 1] != 'undefined') {
			roomStatus[client.room]['socialInfo'][this_round_temp - 1][this_subject_temp - 1] = data.box_quality;
			roomStatus[client.room]['publicInfo'][this_round_temp - 1][this_subject_temp - 1] = data.payoff;
			roomStatus[client.room]['date'][this_round_temp - 1][this_subject_temp - 1] = now.getUTCFullYear() + '-' + (now.getUTCMonth() + 1) +'-' + now.getUTCDate();
			roomStatus[client.room]['time'][this_round_temp - 1][this_subject_temp - 1] = now.getUTCHours()+':'+now.getUTCMinutes()+':'+now.getUTCSeconds()+':'+now.getUTCMilliseconds();
			roomStatus[client.room]['timeSec'][this_round_temp - 1][this_subject_temp - 1] = now.getTime();
		} else {
			roomStatus[client.room]['socialInfo'][this_round_temp - 1] = Array(maxGroupSize).fill(0);
			roomStatus[client.room]['publicInfo'][this_round_temp - 1] = Array(maxGroupSize).fill(0);
			roomStatus[client.room]['date'][this_round_temp - 1] = Array(maxGroupSize).fill(0);
			roomStatus[client.room]['time'][this_round_temp - 1] = Array(maxGroupSize).fill(0);
			roomStatus[client.room]['timeSec'][this_round_temp - 1] = Array(maxGroupSize).fill(0);
			roomStatus[client.room]['socialInfo'][this_round_temp - 1][this_subject_temp - 1] = data.box_quality;
			roomStatus[client.room]['publicInfo'][this_round_temp - 1][this_subject_temp - 1] = data.payoff;
			roomStatus[client.room]['date'][this_round_temp - 1][this_subject_temp - 1] = now.getUTCFullYear() + '-' + (now.getUTCMonth() + 1) +'-' + now.getUTCDate();
			roomStatus[client.room]['time'][this_round_temp - 1][this_subject_temp - 1] = now.getUTCHours()+':'+now.getUTCMinutes()+':'+now.getUTCSeconds()+':'+now.getUTCMilliseconds();
			roomStatus[client.room]['timeSec'][this_round_temp - 1][this_subject_temp - 1] = now.getTime();
		}

		// =========  save data to mongodb
		roomStatus[client.room]['saveDataThisRound'].push(
			{	date: now.getUTCFullYear() + '-' + (now.getUTCMonth() + 1) +'-' + now.getUTCDate()
			,	time: now.getUTCHours()+':'+now.getUTCMinutes()+':'+now.getUTCSeconds()
			,	exp_condition: roomStatus[client.room]['exp_condition']
			,	indivOrGroup: roomStatus[client.room]['indivOrGroup']
			,	groupSize: roomStatus[client.room]['n']
			,	room: client.room
			,	confirmationID: client.session
			,	subjectNumber: client.subjectNumber
			,	amazonID: client.amazonID
			,	round: roomStatus[client.room]['round']
			,	choice: data.box_quality
			,	payoff: data.payoff
			,	totalEarning: data.totalEarning
			,	behaviouralType: 'choice'
			// ,	timeElapsed: timeElapsed
			,	latency: client.latency
			,	socialFreq: roomStatus[client.room]['socialFreq'][roomStatus[client.room]['round']-2]
			,	socialInfo: data.socialInfo
			,	publicInfo: data.publicInfo
			,	maxGroupSize: maxGroupSize
			}
			);
		// console.log(roomStatus[client.room]['saveDataThisRound'])
		// =========  save data to mongodb
    });

	client.on('update_done_n', function(data) {
		let now = new Date()
        ,	logdate = '[' + now.getUTCFullYear() + '/' + (now.getUTCMonth() + 1) + '/'
    	;
    	logdate += now.getUTCDate() + '/' + now.getUTCHours() + ':' + now.getUTCMinutes() + ':' + now.getUTCSeconds() + ']';
    	console.log(logdate + ' - Client ' + client.session + ' (subNo = ' + client.subjectNumber + ') chose ' + data.box_quality + ' at trial ' + data.this_trial_num + ' (payoff is not determined yet).');

		// 
		// There are two things happening here
		// 1. Incrementing 'doneNo' and if it reached n, proceedRound() is called
		
        if(typeof client.subjectNumber != 'undefined') {
			// Depending on the number of subject who has already done this round,
			// the response to the client changes 
			// (i.e., the next round only starts after all the subject at the moment have chosen their option)
			if(typeof roomStatus[client.room]['doneNo'] != 'undefined') {
				roomStatus[client.room]['doneNo'][roomStatus[client.room]['round']-1]++;
			}
			if(typeof roomStatus[client.room]['socialFreq'][data.this_trial_num-1] == 'undefined') {
				roomStatus[client.room]['socialFreq'][data.this_trial_num-1] = Array(numOptions).fill(0);
				roomStatus[client.room]['socialFreq'][data.this_trial_num-1][data.clicked_box_position-1]++;
			} else {
				roomStatus[client.room]['socialFreq'][data.this_trial_num-1][data.clicked_box_position-1]++;
			}

			let now_endFeedback = new Date()
	        ,	logdate_endFeedback = '[' + now_endFeedback.getUTCFullYear() + '/' + (now_endFeedback.getUTCMonth() + 1) + '/'
	    	;
	    	logdate_endFeedback += now_endFeedback.getUTCDate() + '/' + now_endFeedback.getUTCHours() + ':' + now_endFeedback.getUTCMinutes() + ':' + now_endFeedback.getUTCSeconds() + ']';
	    	logdate_endFeedback += ` - doneNo: ${roomStatus[client.room]['doneNo'][roomStatus[client.room]['round']-1]}, current round is ${roomStatus[client.room]['round']} at ${client.room} in the competitive condition`;
			console.log(logdate_endFeedback);

			// If all the client in this room has made their choice, let's move on
			if (roomStatus[client.room]['doneNo'][roomStatus[client.room]['round']-1] >= roomStatus[client.room]['n']) {
				let now_endResultStage = new Date()
		        ,	logdate_endResultStage = '[' + now_endResultStage.getUTCFullYear() + '/' + (now_endResultStage.getUTCMonth() + 1) + '/'
		    	;
	    		logdate_endResultStage += now_endResultStage.getUTCDate() + '/' + now_endResultStage.getUTCHours() + ':' + now_endResultStage.getUTCMinutes() + ':' + now_endResultStage.getUTCSeconds() + ']';
			  	console.log(logdate_endResultStage + ` - result stage ended at: ${client.room}`);
				roomStatus[client.room]['round']++;
				io.to(client.room).emit('a_competitive_trial_completed', {this_trial_num:roomStatus[client.room]['round'] - 1, socialFreq:roomStatus[client.room]['socialFreq'][data.this_trial_num-1]});
				// if(roomStatus[client.room]['round'] <= horizon) {
				// 	io.to(client.room).emit('a_competitive_trial_completed', {this_trial_num:roomStatus[client.room]['round'] - 1});
				// } else {
				// 	io.to(client.room).emit('show_chart', {socialInfo:roomStatus[client.room]['socialInfo'], publicInfo:roomStatus[client.room]['publicInfo'], date:roomStatus[client.room]['date'], time:roomStatus[client.room]['time'], timeSec:roomStatus[client.room]['timeSec']});
				// }
			}
		}

	});

	client.on('completed all trial in the competitive task', function () {
		let now_endResultStage = new Date()
		,	logdate_endResultStage = '[' + now_endResultStage.getUTCFullYear() + '/' + (now_endResultStage.getUTCMonth() + 1) + '/'
		;
		logdate_endResultStage += now_endResultStage.getUTCDate() + '/' + now_endResultStage.getUTCHours() + ':' + now_endResultStage.getUTCMinutes() + ':' + now_endResultStage.getUTCSeconds() + ']';
			console.log(logdate_endResultStage + ` - all trials ended in the competitive task played by: ${client.room}`);

		// =========  For every 10 rounds, save data to mongodb by loop
		// if(typeof roomStatus[client.room]['round']!='undefined'&roomStatus[client.room]['round'] <= horizon) {
		const worker = createWorker('./worker_threads/savingBehaviouralData_array.js', roomStatus[client.room]['saveDataThisRound']);
		roomStatus[client.room]['saveDataThisRound'] = [];

		io.to(client.id).emit('show_chart', {socialInfo:roomStatus[client.room]['socialInfo'], publicInfo:roomStatus[client.room]['publicInfo'], date:roomStatus[client.room]['date'], time:roomStatus[client.room]['time'], timeSec:roomStatus[client.room]['timeSec']});
	});

	// client.on('choice_is_made_in_competitive_cond', function() {
	// 	// 
	// 	// There are two things happening here
	// 	// 1. Incrementing 'doneNo' and if it reached n, proceedRound() is called
		
    //     if(typeof client.subjectNumber != 'undefined') {
	// 		// Depending on the number of subject who has already done this round,
	// 		// the response to the client changes 
	// 		// (i.e., the next round only starts after all the subject at the moment have chosen their option)
	// 		if(typeof roomStatus[client.room]['doneNo'] != 'undefined') {
	// 			roomStatus[client.room]['doneNo'][roomStatus[client.room]['round']-1]++;
	// 		}
	// 		let now_endFeedback = new Date()
	//         ,	logdate_endFeedback = '[' + now_endFeedback.getUTCFullYear() + '/' + (now_endFeedback.getUTCMonth() + 1) + '/'
	//     	;
	//     	logdate_endFeedback += now_endFeedback.getUTCDate() + '/' + now_endFeedback.getUTCHours() + ':' + now_endFeedback.getUTCMinutes() + ':' + now_endFeedback.getUTCSeconds() + ']';
	//     	logdate_endFeedback += ` - doneNo: ${roomStatus[client.room]['doneNo'][roomStatus[client.room]['round']-1]}, current round is ${roomStatus[client.room]['round']} at ${client.room} in the competitive condition`;
	// 		console.log(logdate_endFeedback);

	// 		// If all the client in this room has made their choice, let's move on
	// 		if (roomStatus[client.room]['doneNo'][roomStatus[client.room]['round']-1] >= roomStatus[client.room]['n']) {
	// 			let now_endResultStage = new Date()
	// 	        ,	logdate_endResultStage = '[' + now_endResultStage.getUTCFullYear() + '/' + (now_endResultStage.getUTCMonth() + 1) + '/'
	// 	    	;
	//     		logdate_endResultStage += now_endResultStage.getUTCDate() + '/' + now_endResultStage.getUTCHours() + ':' + now_endResultStage.getUTCMinutes() + ':' + now_endResultStage.getUTCSeconds() + ']';
	// 		  	console.log(logdate_endResultStage + ` - result stage ended at: ${client.room}`);
	// 		  	io.to(client.room).emit('a_competitive_trial_completed');
	// 		}
	// 	}
    // });

    client.on('this_trial_is_done', function() {
		// 
		// There are two things happening here
		// 1. Incrementing 'doneNo' and if it reached n, proceedRound() is called
		// 2. Storing choice data to the mongoDB (using the workerThreads)
		// 
        if(typeof client.subjectNumber != 'undefined') {
			// Depending on the number of subject who has already done this round,
			// the response to the client changes 
			// (i.e., the next round only starts after all the subject at the moment have chosen their option)
			if(typeof roomStatus[client.room]['doneNo'] != 'undefined') {
				roomStatus[client.room]['doneNo'][roomStatus[client.room]['round']-1]++;
			}
			let now_endFeedback = new Date()
	        ,	logdate_endFeedback = '[' + now_endFeedback.getUTCFullYear() + '/' + (now_endFeedback.getUTCMonth() + 1) + '/'
	    	;
	    	logdate_endFeedback += now_endFeedback.getUTCDate() + '/' + now_endFeedback.getUTCHours() + ':' + now_endFeedback.getUTCMinutes() + ':' + now_endFeedback.getUTCSeconds() + ']';
	    	logdate_endFeedback += ` - doneNo: ${roomStatus[client.room]['doneNo'][roomStatus[client.room]['round']-1]}, current round is ${roomStatus[client.room]['round']} at ${client.room}`;
			console.log(logdate_endFeedback);

			// If all the client in this room has made their choice, let's move on
			if (roomStatus[client.room]['doneNo'][roomStatus[client.room]['round']-1] >= roomStatus[client.room]['n']) {
				let now_endResultStage = new Date()
		        ,	logdate_endResultStage = '[' + now_endResultStage.getUTCFullYear() + '/' + (now_endResultStage.getUTCMonth() + 1) + '/'
		    	;
	    		logdate_endResultStage += now_endResultStage.getUTCDate() + '/' + now_endResultStage.getUTCHours() + ':' + now_endResultStage.getUTCMinutes() + ':' + now_endResultStage.getUTCSeconds() + ']';
			  	console.log(logdate_endResultStage + ` - result stage ended at: ${client.room}`);

			  	// =========  For every 10 rounds, save data to mongodb by loop
			  	// if(typeof roomStatus[client.room]['round']!='undefined'&roomStatus[client.room]['round'] <= horizon) {
			  	if(typeof roomStatus[client.room]['round']!='undefined'&roomStatus[client.room]['round'] % 10 == 0) { //if(roomStatus[client.room]['indivOrGroup'] != 0) {
					const worker = createWorker('./worker_threads/savingBehaviouralData_array.js', roomStatus[client.room]['saveDataThisRound']);
			  		roomStatus[client.room]['saveDataThisRound'] = [];
				}
			  	// =========  save data to mongodb by loop END
			  	proceedRound(client); // this is a function defined below👇
			}
		}
    });

	client.on('go_to_summary_page', function (data) {
		io.to(client.session).emit('show_chart', {myChoices:data.myChoices, myEarnings:data.myEarnings, socialInfo:roomStatus[client.room]['socialInfo'], publicInfo:roomStatus[client.room]['publicInfo'], date:roomStatus[client.room]['date'], time:roomStatus[client.room]['time'], timeSec:roomStatus[client.room]['timeSec']});
	});

	client.on('choice made', function (data) {
		let now = new Date()
        ,	logdate = '[' + now.getUTCFullYear() + '/' + (now.getUTCMonth() + 1) + '/'
    	, doneNum
    	, timeElapsed = now - firstTrialStartingTime
    	;
    	logdate += now.getUTCDate() + '/' + now.getUTCHours() + ':' + now.getUTCMinutes() + ':' + now.getUTCSeconds() + ']';
    	console.log(logdate + ' - Client ' + client.session + ' (subNo = ' + client.subjectNumber + ') chose ' + data.choice + ' and got ' + data.payoff + ' at trial ' + data.thisTrial + '.');
    	// update roomStatus
    	if (typeof roomStatus[client.room] != 'undefined' & typeof client.subjectNumber != 'undefined') {
	    	roomStatus[client.room]['doneId'][roomStatus[client.room]['round']-1].push(client.subjectNumber);
			doneNum = roomStatus[client.room]['doneId'][roomStatus[client.room]['round']-1].length;
			roomStatus[client.room]['socialInfo'][roomStatus[client.room]['round']-1][doneNum-1] = data.choice;
			roomStatus[client.room]['publicInfo'][roomStatus[client.room]['round']-1][doneNum-1] = data.payoff;
			roomStatus[client.room]['choiceOrder'][roomStatus[client.room]['round']-1][doneNum-1] = client.subjectNumber;
			if( roomStatus[client.room]['round'] < horizon ) {
				if (doneNum <= 1) {
					// summarise social information
				  	for (let i = 0; i < numOptions; i++) {
						roomStatus[client.room]['socialFreq'][roomStatus[client.room]['round']][i] = 0;
					}
				}
				if (data.choice === 'sure') {
					roomStatus[client.room]['socialFreq'][roomStatus[client.room]['round']][0]++;
				} else if (data.choice === 'risky') {
					roomStatus[client.room]['socialFreq'][roomStatus[client.room]['round']][1]++;
				}
			}
			//client.emit('your instant number is ', client.subjectNumber-1);
			io.to(client.room).emit('these are done subjects', {doneSubject:roomStatus[client.room]['doneId'][roomStatus[client.room]['round']-1]});

			// =========  save data to mongodb
			roomStatus[client.room]['saveDataThisRound'].push(
				{	date: now.getUTCFullYear() + '-' + (now.getUTCMonth() + 1) +'-' + now.getUTCDate()
				,	time: now.getUTCHours()+':'+now.getUTCMinutes()+':'+now.getUTCSeconds()
				,	exp_condition: roomStatus[client.room]['exp_condition']
				// ,	isLeftRisky: roomStatus[client.room]['isLeftRisky']
				,	indivOrGroup: roomStatus[client.room]['indivOrGroup']
				,	groupSize: roomStatus[client.room]['n']
				,	room: client.room
				,	confirmationID: client.session
				,	subjectNumber: client.subjectNumber
				,	amazonID: client.amazonID
				,	round: roomStatus[client.room]['round']
				,	choice: data.choice
				,	payoff: data.payoff
				,	totalEarning: data.totalEarning
				,	behaviouralType: 'choice'
				,	timeElapsed: timeElapsed
				,	latency: client.latency
				,	socialFreq: roomStatus[client.room]['socialFreq'][roomStatus[client.room]['round']-1]
				,	socialInfo: data.socialInfo
				,	publicInfo: data.publicInfo
				,	maxGroupSize: maxGroupSize
				,	riskDistributionId: data.riskDistributionId
				,	optionOrder: roomStatus[client.room]['optionOrder']
				}
				);
			// =========  save data to mongodb
		}
	});


	client.on('Data from Indiv', function (data) {
		let now = new Date()
        ,	logdate = '[' + now.getUTCFullYear() + '/' + (now.getUTCMonth() + 1) + '/'    	;
    	logdate += now.getUTCDate() + '/' + now.getUTCHours() + ':' + now.getUTCMinutes() + ':' + now.getUTCSeconds() + ']';
    	console.log(logdate + ' - Client ' + client.session + ' (subNo = ' + client.subjectNumber + ') ended the task.');

    	for(let i=0; i<data.length; i++) {
	  	}
	});

	client.on('result stage ended', function () {
		if(typeof client.subjectNumber != 'undefined') {
			// Depending on the number of subject who has already done this round,
			// the response to the client changes 
			// (i.e., the next round only starts after all the subject at the moment have chosen their option)
			if(typeof roomStatus[client.room]['doneNo'][roomStatus[client.room]['round']-1] != 'undefined') {
				roomStatus[client.room]['doneNo'][roomStatus[client.room]['round']-1]++;
			}else{
				roomStatus[client.room]['doneNo'][roomStatus[client.room]['round']-1] = 1;
			}
			let now_endFeedback = new Date()
	        ,	logdate_endFeedback = '[' + now_endFeedback.getUTCFullYear() + '/' + (now_endFeedback.getUTCMonth() + 1) + '/'
	    	;
	    	logdate_endFeedback += now_endFeedback.getUTCDate() + '/' + now_endFeedback.getUTCHours() + ':' + now_endFeedback.getUTCMinutes() + ':' + now_endFeedback.getUTCSeconds() + ']';
	    	logdate_endFeedback += ` - doneNo: ${roomStatus[client.room]['doneNo'][roomStatus[client.room]['round']-1]}, current round is ${roomStatus[client.room]['round']} at ${client.room}`;
			console.log(logdate_endFeedback);
			if (roomStatus[client.room]['doneNo'][roomStatus[client.room]['round']-1] >= roomStatus[client.room]['n']) {
				let now_endResultStage = new Date()
		        ,	logdate_endResultStage = '[' + now_endResultStage.getUTCFullYear() + '/' + (now_endResultStage.getUTCMonth() + 1) + '/'
		    	;
	    		logdate_endResultStage += now_endResultStage.getUTCDate() + '/' + now_endResultStage.getUTCHours() + ':' + now_endResultStage.getUTCMinutes() + ':' + now_endResultStage.getUTCSeconds() + ']';
			  	console.log(logdate_endResultStage + ` - result stage ended at: ${client.room}`);

			  	// =========  save data to mongodb by loop
			  	// if(typeof roomStatus[client.room]['round']!='undefined'&roomStatus[client.room]['round'] <= horizon) {
			  	if(typeof roomStatus[client.room]['round']!='undefined'&roomStatus[client.room]['round'] % 10 == 0) { //if(roomStatus[client.room]['indivOrGroup'] != 0) {
					const worker = createWorker('./worker_threads/savingBehaviouralData_array.js', roomStatus[client.room]['saveDataThisRound']);
			  		roomStatus[client.room]['saveDataThisRound'] = [];

				  	// for(let i=0; i<roomStatus[client.room]['saveDataThisRound'].length; i++) {
				  	// 	const worker = createWorker('./worker_threads/savingBehaviouralData_array.js', 
							// roomStatus[client.room]['saveDataThisRound'][i], roomStatus[client.room]['membersID'][i]);
				  	// 	// Delete all the data that has already been saved:
				  	// 	if (i == roomStatus[client.room]['saveDataThisRound'].length - 1) { // executing after this for loop
				  	// 		roomStatus[client.room]['saveDataThisRound'] = [];
				  	// 	}
				  	// }
				}
			  	// =========  save data to mongodb by loop END
			  	// =========  save data to mongodb
			  	/*const worker = createWorker('./worker_threads/savingBehaviouralData.org.js', 
					roomStatus[client.room]['saveDataThisRound'], client.room);
			  	*/
			  	// =========  save data to mongodb END
			  	proceedRound(client);
			}
		}
	});

	client.on("disconnect", function () {
		if(typeof client.room != 'undefined') {
			let thisRoomName = client.room;

			// ======= remove this client from the room =====
			client.leave(client.room);
			if (thisRoomName != 'finishedRoom') {
				total_N_now--;
			}

			roomStatus[thisRoomName]['disconnectedList'].push(client.session);
			let idPosition;
			//let subjectNumberPosition;
			if(roomStatus[thisRoomName]['membersID'].indexOf(client.session) > -1) {
				idPosition = roomStatus[thisRoomName]['membersID'].indexOf(client.session);
			}
			roomStatus[thisRoomName]['membersID'].splice(idPosition, 1);
			roomStatus[thisRoomName]['subjectNumbers'].splice(idPosition, 1);
			sessionNameSpace[client.session] = 0;

			let doneOrNot = -1;
			// This doneOrNot checks whether the disconnected client has not 
			// yet made a choice in the main stage. If doneOrNot > -1, it means
			// this client has already done the choice.
			if(typeof roomStatus[thisRoomName]['doneId'][roomStatus[thisRoomName]['round']-1] != 'undefined') {
				doneOrNot = roomStatus[thisRoomName]['doneId'][roomStatus[thisRoomName]['round']-1].indexOf(client.subjectNumber);
			} 
			if(doneOrNot > -1){
				roomStatus[thisRoomName]['doneId'][roomStatus[thisRoomName]['round']-1].splice(doneOrNot, 1);
				roomStatus[client.room]['socialInfo'][roomStatus[client.room]['round']-1].splice(doneOrNot, 1);
				roomStatus[client.room]['socialInfo'][roomStatus[client.room]['round']-1].push(-1);
				if(typeof roomStatus[client.room]['doneNo'][roomStatus[client.room]['round']-1] != 'undefined') {
					roomStatus[client.room]['doneNo'][roomStatus[client.room]['round']-1]--;
				}
			}

			if(roomStatus[thisRoomName]['indivOrGroup'] != 0) {
				// =========  save data to mongodb by loop
				const worker = createWorker('./worker_threads/savingBehaviouralData_array.js', roomStatus[client.room]['saveDataThisRound']);
		  		roomStatus[client.room]['saveDataThisRound'] = [];
		  		// =========  save data to mongodb by loop END
				roomStatus[thisRoomName]['n']--;
				// Note on the line above 👆: 
				// if this is the Individual condition session's room, then I want 'n' to remain 1
				// so than no one will never enter this room again. 
				// On the other hand, if this is a group session's room, reducing 'n' may open up 
				// a room for a new-comer if this room is still at the first waiting screen
				if (roomStatus[client.room]['doneNo'][roomStatus[client.room]['round']-1] >= roomStatus[client.room]['n'] & roomStatus[client.room]['n'] > 0) {
				  	console.log(`result stage ended at: ${client.room}`);
				  	proceedRound(client);
				}
			} else { // if this is the individual condition
				const worker = createWorker('./worker_threads/savingBehaviouralData_array.js', roomStatus[client.room]['saveDataThisRound']);
			  	roomStatus[client.room]['saveDataThisRound'] = [];
			}
			// ======= remove this client from the room =====

			// This section checks if all clients in the room finishes the comprehension test.
			// If so, the room should move on to the main task.
			if (roomStatus[client.room]['n']>0 && roomStatus[client.room]['stage'] == 'secondWaitingRoom') {
				if (roomStatus[client.room]['testPassed'] >= roomStatus[client.room]['n']) {
					let now612 = new Date(),
					logdate675 = '['+now612.getUTCFullYear()+'/'+(now612.getUTCMonth()+1)+'/';
					logdate675 += now612.getUTCDate()+'/'+now612.getUTCHours()+':'+now612.getUTCMinutes()+':'+now612.getUTCSeconds()+']';
					console.log(logdate675 + ' - ' + client.room + ' is ready to start the game.');
					io.to(client.room).emit('all passed the test'
						, {n:roomStatus[client.room]['n']
						, testPassed:roomStatus[client.room]['testPassed']
						, exp_condition:roomStatus[client.room]['exp_condition']});
					firstTrialStartingTime = now612;
					roomStatus[client.room]['stage'] = 'mainTask';
				}
			}

			
			io.to(thisRoomName).emit('client disconnected', 
			{	roomStatus:roomStatus[thisRoomName]
				, disconnectedClient:client.id
				, disconnectedSubjectNumber:client.subjectNumber
			});

			// When this disconnection made the groupSize == 0, 
			// waiting room's clock should be reset.
			// If I don't do this, the next new subject would not have time to wait other people.
			if(roomStatus[thisRoomName]['n'] <= 0){
				stopAndResetClock(thisRoomName);
			}

			var now744 = new Date(),
			logdate744 = '['+now744.getUTCFullYear()+'/'+(now744.getUTCMonth()+1)+'/';
			logdate744 += now744.getUTCDate()+'/'+now744.getUTCHours()+':'+now744.getUTCMinutes()+':'+now744.getUTCSeconds()+']';
			console.log(logdate744+' - client disconnected: '+ client.session+' ('+client.amazonID+')'+' (room N: '+roomStatus[thisRoomName]['n']+', total N: '+total_N_now+') - handshakeID:'+ client.session);
		}
	});
});

// ==========================================
// Functions
// ==========================================

// shuffling function
function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex;

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


//weightedRand2({0:prob_binary, 1:(1-prob_binary)});


function proceedRound (client) {
	roomStatus[client.room]['round']++;
	if(roomStatus[client.room]['round'] <= horizon) {
		io.to(client.room).emit('Proceed to next round', roomStatus[client.room]);
	} else {
		// io.to(room).emit('End this session', roomStatus[client.room]);
		io.to(client.room).emit('show_chart', {socialInfo:roomStatus[client.room]['socialInfo'], publicInfo:roomStatus[client.room]['publicInfo'], date:roomStatus[client.room]['date'], time:roomStatus[client.room]['time'], timeSec:roomStatus[client.room]['timeSec']});
	}
}

function countDown(room) {
	//console.log('rest time of ' + room + ' is ' + roomStatus[room]['restTime']);
	roomStatus[room]['restTime'] -= 500;
	if (roomStatus[room]['restTime'] < 0) {
	//setTimeout(function(){ startSession(room) }, 1500); // this delay allows the 'start' text's effect
	if(roomStatus[room]['n'] < minGroupSize && roomStatus[room]['indivOrGroup'] != 0) {
	 	roomStatus[room]['starting'] = 1;
	  	io.to(room).emit('you guys are individual condition');
	} else {
	  	startSession(room);
	}
	//clearTimeout(countDownWaiting[room]);
	} else {
		let room2 = room;
		countDownWaiting[room] = setTimeout(function(){ countDown(room2) }, 500);
	}
}

function startSession (room) {
	if(typeof countDownWaiting[room] != 'undefined') {
		clearTimeout(countDownWaiting[room]);
	}
	roomStatus[room]['starting'] = 1;
	if (roomStatus[room]['n'] < minGroupSize) {
		roomStatus[room]['indivOrGroup'] = 0; // individual condition
	} else {
		roomStatus[room]['indivOrGroup'] = 1; // group condition
	}
	io.to(room).emit('this room gets started'
		, {room:room
		, n:roomStatus[room]['n']
		, exp_condition:roomStatus[room]['exp_condition']
		// , isLeftRisky:roomStatus[room]['isLeftRisky']
		, indivOrGroup:roomStatus[room]['indivOrGroup']
		, maxChoiceStageTime:maxChoiceStageTime 
	});
	var now814 = new Date(),
	  	logdate814 = '['+now814.getUTCFullYear()+'/'+(now814.getUTCMonth()+1)+'/';
	  	logdate814 += now814.getUTCDate()+'/'+now814.getUTCHours()+':'+now814.getUTCMinutes()+':'+now814.getUTCSeconds()+']';
	console.log(logdate814+' - session started in '+room);
}

function parameterEmitting (client) {
	io.to(client.session).emit('this_is_your_parameters'
		, { id: client.session
			, room: client.room
			, condition: client.condition
			, maxChoiceStageTime: maxChoiceStageTime
			, maxTimeTestScene: maxTimeTestScene
			, exp_condition:roomStatus[client.room]['exp_condition']
			, riskDistributionId:roomStatus[client.room]['riskDistributionId']
			, subjectNumber: client.subjectNumber
			, indivOrGroup: roomStatus[client.room]['indivOrGroup']
			, numOptions: numOptions
			, optionOrder: roomStatus[client.room]['optionOrder'] 
			, maxGroupSize: maxGroupSize
		});
	let nowEmitting = new Date(),
	  	logdateEmitting = '['+nowEmitting.getUTCFullYear()+'/'+(nowEmitting.getUTCMonth()+1)+'/';
	  	logdateEmitting += nowEmitting.getUTCDate()+'/'+nowEmitting.getUTCHours()+':'+nowEmitting.getUTCMinutes()+':'+nowEmitting.getUTCSeconds()+']';
	console.log(logdateEmitting+' - parameters were sent to ' + client.session + ' in room ' + client.room);
}

function startWaitingStageClock (room) {
    var now823 = new Date(),
        logtxt823 = '['+now823.getUTCFullYear()+'/'+(now823.getUTCMonth()+1)+'/';
        logtxt823 += now823.getUTCDate()+'/'+now823.getUTCHours()+':'+now823.getUTCMinutes()+':'+now823.getUTCSeconds()+']';
        logtxt823 += ' - Waiting room opened at '+ room;
    console.log(logtxt823);
    countDown(room);
}

function stopAndResetClock (room) {
  	clearTimeout(countDownWaiting[room]);
  	roomStatus[room]['restTime'] = maxWaitingTime;
}


// function generating a Gaussien random variable
;

// a function to create an n-dimensional array
function createArray(length) {
    var arr = new Array(length || 0),
        i = length;

    if (arguments.length > 1) {
        var args = Array.prototype.slice.call(arguments, 1);
        while(i--) arr[length-1 - i] = createArray.apply(this, args);
    }

    return arr;
}

// worker_thread
function createWorker(path, wd, id) {
	const w = new Worker(path, {workerData: wd});

	w.on('error', (err) => {
		console.error(`Worker ${w.workerData} error`)
		console.error(err);
	});

	w.on('exit', () => {
		let exitTime = new Date(),
			exitlogtxt = '[' + exitTime.getUTCFullYear() + '/' + (exitTime.getUTCMonth() + 1) + '/';
			exitlogtxt += exitTime.getUTCDate() + '/' + exitTime.getUTCHours() + ':' + exitTime.getUTCMinutes() + ':' + exitTime.getUTCSeconds() + ']';
			exitlogtxt += ` - exitted! : ${id}`;
		console.log(exitlogtxt);
	});

	w.on('message', (msg) => {
		let messageTime = new Date(),
			messagelogtxt = '[' + messageTime.getUTCFullYear() + '/' + (messageTime.getUTCMonth() + 1) + '/';
			messagelogtxt += messageTime.getUTCDate() + '/' + messageTime.getUTCHours() + ':' + messageTime.getUTCMinutes() + ':' + messageTime.getUTCSeconds() + ']';
			messagelogtxt += ` - [Main] Message got from worker ${msg}`;
		// workerスレッドから送信されたメッセージ
		console.log(messagelogtxt);
	});
	return w;
}

function makeid(length) {
   var result           = '';
   var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
   var charactersLength = characters.length;
   for ( var i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
   }
   return result;
}
