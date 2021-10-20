/*===============================================================
// Multi-argent two-armed bandit task
// Author: Wataru Toyokawa
// Collaborating with Professor Wolfgang Gaissmaier
// Requirements:
//    * Node.js
//    * node_modules: express, socket.io, fast-csv, php-express
// ============================================================== */

// Loading modules
const csv = require("fast-csv")
,	fs = require('fs')
,	path = require("path")
,	express = require('express')
,	app = express()
,	server = require('http').Server(app)
,	io = require('socket.io')(server, {
  // below are engine.IO options
  pingInterval: 1000, // A ping-pong heart beating is emitted every 1 second
  pingTimeout: 6000 // If client's latency is more than 5 sec. then he/she is disconnected
  })
,	routes = require('./routes')
, bodyParser = require("body-parser")
;

// Connecting to mongoDB collection
/*
  To run this experimental server-side code, you need to create a mongoDB ?? in advance.

*/
const mongoose = require('mongoose');
const dbName = 'mongodb://127.0.0.1:27017/twoArmedTask2020';
// defining a model
var Behaviour = require('./models/behaviouralData');

// Experimental variables
const EXP_CONDITION = 0 // 0 = distributive; 1 = additive
,	SESSION_NO = 0 // 0 = debug; 100~ TEST
, NUM_TRIAL = 20 // 100?
, POINT_TO_US_CENT = (0.4)/7//0.25 // we need to adjust it to make sure the real payment falls into a reasonable range
, MAX_NUM_PLAYER = 4
, MAX_WAITING_TIME = 30*1000//3*60*1000 
, MAX_CHOICE_STAGE_TIME = 600*1000 //60*1000 
, MAX_TIME_TESTSCENE = 4* 60*1000 // 4*60*1000
//, MAX_WAITING_TIME = 20*1000 // debug
//, MAX_CHOICE_STAGE_TIME = 60*1000 // debug
//, MAX_TIME_TESTSCENE = 60*1000 // debug
, sigmaGlobal = 6 //0.9105
, sigmaIndividual = 6 //0.9105 // this gives 50% overlap between two normal distributions whose mean diff. is 1.1666..
, numOptions = 5
;

// date and time
let myD = new Date()
, myYear = myD.getFullYear()
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
const currentSubject = 0
, firstRoomName = myMonth+myDate+myHour+myMin+'_session_'+SESSION_NO
,	roomStatus = {}
, sessionNameSpace = {}
, idAssignedThisSession = []
,	portnum = 8080
;
// experimental status
let num_Player = 0
, finish_number
, countDownMainStage = {}
, countDownWaiting = {}
//, saveDataThisRound = []
, firstTrialStartingTime
;
countDownMainStage[firstRoomName] = new Object();
countDownWaiting[firstRoomName] = new Object();

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Routings
const gameRouter = require('./routes/game');
// Assigning routers to Routing
app.use('/', gameRouter);

roomStatus['finishedRoom'] = {
    EXP_CONDITION: EXP_CONDITION,
    indivOrGroup: -1,
    n: 0,
    membersID: [],
    subjectNumbers: [],
    disconnectedList: [],
    testPassed: 0,
    starting: 0,
    stage: 'firstWaiting',
    MAX_CHOICE_STAGE_TIME: MAX_CHOICE_STAGE_TIME,
    choiceTime: [],
    round: 1,
    doneId: [],
    doneNo: [],
    socialInfo:[],
    publicInfo:[],
    choiceOrder:[],
    saveDataThisRound: [],
    restTime:MAX_WAITING_TIME
};
// The following is the first room
// Therefore, Object.keys(roomStatus).length = 2 right now
// A new room will be open once this room becomes full
roomStatus[firstRoomName] = {
    EXP_CONDITION: EXP_CONDITION,
    indivOrGroup: -1,
    n: 0,
    membersID: [],
    subjectNumbers: [],
    disconnectedList: [],
    testPassed: 0,
    starting: 0,
    stage: 'firstWaiting',
    MAX_CHOICE_STAGE_TIME: MAX_CHOICE_STAGE_TIME,
    choiceTime: [],
    round: 1,
    doneId: [],
    doneNo: [],
    socialInfo:[],
    publicInfo:[],
    choiceOrder:[],
    saveDataThisRound: [],
    restTime:MAX_WAITING_TIME
};



const port = process.env.PORT || portnum;

server.listen(port, function() {
  let now = new Date(),
      logtxt = '[' + now.getUTCFullYear() + '/' + (now.getUTCMonth() + 1) + '/';
  logtxt += now.getUTCDate() + '/' + now.getUTCHours() + ':' + now.getUTCMinutes() + ':' + now.getUTCSeconds() + ']';
  logtxt += ' - Two-armed bandit task server listening on port ' + port + '; condition: ' + EXP_CONDITION + '; max_n_per_rooom = '+MAX_NUM_PLAYER;
  console.log(logtxt);
  // connecting to mongodb server
  mongoose.connect(dbName, {useNewUrlParser: true, useUnifiedTopology: true}, (err, db) => {
    console.log("Connected successfully to server");
  });
});

var csvStream
, dataName = "social_generalization_1D_condition_"+EXP_CONDITION+'_'+myYear //+myMonth+myDate+myHour+myMin
;

console.log('This session\'s dataName is ' + dataName);

/**
 * Socket.IO Connection.
 */
io.on('connection', function (client) {
  // client's unique identifier 
  client.amazonID = client.request._query.amazonID;
  // putting this client into a experimental room
  if (typeof client.request._query.sessionName == 'undefined') {
      // client.sessionName: this is an unique code for each participant
      client.session = client.id;
      client.join(client.session);
      sessionNameSpace[client.session] = 1;
  } else if (client.request._query.sessionName == 'already_finished'){
      // Some web browsers may try to reconnect with this game server when the browser
      // is forced to disconnect. The following script will assure 
      // that such reconnected subject will not go to a normal room, 
      // but to the 'finishedRoom' where nothing will ever never happen.
      client.session = client.request._query.sessionName;
      client.room = 'finishedRoom';
      client.join(client.session);
      client.join(client.room);
  } else {
      // When client comes back from a short disconnection
      client.session = client.request._query.sessionName;
      client.room = client.request._query.roomName;
      client.join(client.session);
      client.join(client.room);
      client.emit('S_to_C_welcomeback', {sessionName: client.session, roomName: client.room});
      num_Player++;
      sessionNameSpace[client.session] == 1;
      var now = new Date(),
          logdate = '['+now.getUTCFullYear()+'/'+(now.getUTCMonth()+1)+'/';
          logdate += now.getUTCDate()+'/'+now.getUTCHours()+':'+now.getUTCMinutes()+':'+now.getUTCSeconds()+']';
      console.log(logdate+' - '+ client.session +'('+client.amazonID+') in room '+client.room+' reconnected to the server');
      if(typeof roomStatus[client.room]['n'] == 'undefined'){
        roomStatus[client.room] = {
              EXP_CONDITION: EXP_CONDITION,
              indivOrGroup: -1,
              n: 0,
              membersID: [],
              subjectNumbers: [],
              disconnectedList: [],
              testPassed: 0,
              starting: 0,
              stage: 'firstWaiting',
              MAX_CHOICE_STAGE_TIME: MAX_CHOICE_STAGE_TIME,
              choiceTime: [],
              round: 1,
              doneId: [],
              doneNo: [],
              socialInfo:[],
              publicInfo:[],
              choiceOrder:[]
          };
        roomStatus[client.room]['n']++;
        roomStatus[client.room]['total_n']++;
        roomStatus[client.room]['membersID'].push(client.session);
      } else {
        roomStatus[client.room]['n']++;
        roomStatus[client.room]['total_n']++;
      }
  }

  // Randomly assigning a payoff landscape to the client without duplication
  let flag = true;
  while (flag) {
    client.landscapeId = rand(500, 1);
    if(idAssignedThisSession.indexOf(client.landscapeId)==-1){
      idAssignedThisSession.push(client.landscapeId);
      flag = false;
    }
  }

  // When client's game window is ready & latency was calculated
  client.on('core is ready', function(data) {
    var now = new Date();
    var logdate = '['+now.getUTCFullYear()+'/'+(now.getUTCMonth()+1)+'/';
    logdate += now.getUTCDate()+'/'+now.getUTCHours()+':'+now.getUTCMinutes()+':'+now.getUTCSeconds()+']';
    logdate += ' - Client: ' + client.session +'('+client.amazonID+') responds with an average latency = '+ data.latency + ' ms.'; 
    client.latency = data.latency;
    console.log(logdate);
    if(data.latency < data.maxLatencyForGroupCondition) {
      // ===============================================================
      // Let the client join the newest room
      client.roomFindingCounter = 1; // default: roomStatus = {'finishedRoom', 'session_100'}
      while (typeof client.room == 'undefined') {
        // if there are still rooms to check
        if (client.roomFindingCounter <= Object.keys(roomStatus).length - 1) {
          if(roomStatus[Object.keys(roomStatus)[client.roomFindingCounter]]['starting'] == 0 && roomStatus[Object.keys(roomStatus)[client.roomFindingCounter]]['n'] < MAX_NUM_PLAYER && roomStatus[Object.keys(roomStatus)[client.roomFindingCounter]]['restTime'] > 0) {
            //console.log(roomStatus[Object.keys(roomStatus)[client.roomFindingCounter]]);
            client.room = Object.keys(roomStatus)[client.roomFindingCounter];
            var now = new Date();
            var logdate = '['+now.getUTCFullYear()+'/'+(now.getUTCMonth()+1)+'/';
            logdate += now.getUTCDate()+'/'+now.getUTCHours()+':'+now.getUTCMinutes()+':'+now.getUTCSeconds()+']';
            console.log(logdate+' - '+ client.session +'('+client.amazonID+')'+' joined to '+ client.room +' (n: '+roomStatus[client.room]['n']+', total N: '+num_Player+')');
          } else {
            client.roomFindingCounter++;
          }
        } else {
          // else if there is no more available room left
          // Make a new room
          client.newRoomName = myMonth+myDate+myHour+myMin+'_session_' + (SESSION_NO + Object.keys(roomStatus).length - 1);
          roomStatus[client.newRoomName] = 
          {
              EXP_CONDITION: EXP_CONDITION,
              indivOrGroup: -1,
              n: 0,
              membersID: [],
              subjectNumbers: [],
              disconnectedList: [],
              testPassed: 0,
              starting: 0,
              stage: 'firstWaiting',
              MAX_CHOICE_STAGE_TIME: MAX_CHOICE_STAGE_TIME,
              choiceTime: [],
              round: 1,
              doneId: [],
              doneNo: [],
              socialInfo:[],
              publicInfo:[],
              choiceOrder:[],
              saveDataThisRound: [],
              restTime:MAX_WAITING_TIME
          };
          // Register the client to the new room
          client.room = client.newRoomName;
          var now = new Date();
          var logdate = '['+now.getUTCFullYear()+'/'+(now.getUTCMonth()+1)+'/';
          logdate += now.getUTCDate()+'/'+now.getUTCHours()+':'+now.getUTCMinutes()+':'+now.getUTCSeconds()+']';
          console.log(logdate+' - '+ client.session +'('+client.amazonID+')'+' joined to '+ client.room +' (n: '+roomStatus[client.room]['n']+', total N: '+num_Player+')');
          // Make a clock object in the new room
          countDownMainStage[client.room] = new Object();
          countDownWaiting[client.room] = new Object();
        }
      }
      
      // Let the client join the registered room
      client.join(client.room);
      io.to(client).emit('S_to_C_clientSessionName', {sessionName: client.session, roomName: client.room});
      
      num_Player++;
      roomStatus[client.room]['n']++
      roomStatus[client.room]['membersID'].push(client.session);
      client.subNumCounter = 1;
      while (typeof client.subjectNumber == 'undefined') {
        if (roomStatus[client.room]['subjectNumbers'].indexOf(client.subNumCounter) == -1) {
          roomStatus[client.room]['subjectNumbers'].push(client.subNumCounter);
          client.subjectNumber = client.subNumCounter;
        } else {
          client.subNumCounter++;
        }
      }
      // ==================== copied END =========================
    } else {
      // else if latency is too large
      // then this subject is go to the individual condition
      client.newRoomName = myMonth+myDate+myHour+myMin+'_sessionIndiv_' + (SESSION_NO + Object.keys(roomStatus).length - 1);
      roomStatus[client.newRoomName] = 
      {
          EXP_CONDITION: EXP_CONDITION,
          indivOrGroup: 0,
          n: 0,
          membersID: [],
          subjectNumbers: [],
          disconnectedList: [],
          testPassed: 0,
          starting: 0,
          stage: 'firstWaiting',
          MAX_CHOICE_STAGE_TIME: MAX_CHOICE_STAGE_TIME,
          choiceTime: [],
          round: 1,
          doneId: [],
          doneNo: [],
          socialInfo:[],
          publicInfo:[],
          choiceOrder:[],
          saveDataThisRound: [],
          restTime:1000
      };
      // Register the client to the new room
      client.room = client.newRoomName;
      var now = new Date();
      var logdate = '['+now.getUTCFullYear()+'/'+(now.getUTCMonth()+1)+'/';
      logdate += now.getUTCDate()+'/'+now.getUTCHours()+':'+now.getUTCMinutes()+':'+now.getUTCSeconds()+']';
      console.log(logdate+' - '+ client.session +'('+client.amazonID+')'+' joined to '+ client.room +' (n: '+roomStatus[client.room]['n']+', total N: '+num_Player+')');
      // Let the client join the registered room
      client.join(client.room);
      io.to(client).emit('S_to_C_clientSessionName', {sessionName: client.session, roomName: client.room});
      client.subjectNumber = 1;
      num_Player++;
      roomStatus[client.room]['n']++
      roomStatus[client.room]['membersID'].push(client.session);
    }


    client.emit('this is your parameters', { id: client.session, room: client.room, landscapeId: client.landscapeId, MAX_CHOICE_STAGE_TIME: MAX_CHOICE_STAGE_TIME, MAX_TIME_TESTSCENE: MAX_TIME_TESTSCENE, EXP_CONDITION:EXP_CONDITION, subjectNumber: client.subjectNumber, POINT_TO_US_CENT: POINT_TO_US_CENT, indivOrGroup: roomStatus[client.room]['indivOrGroup'], n: roomStatus[client.room]['n']}); // io.emit() if you want to send it to all clients

  });
  
  client.on('landscape was set', function (data) {
    if(client.room != 'finishedRoom') {
      // csvStream starts if this client is the first participant in this entire session
      if (num_Player === 1){
        csvStream = csv.format({headers: true, quoteColumns: true});
        csvStream
              .pipe(fs.createWriteStream(path.resolve("./data", dataName+'_'+client.room+'.csv')))
              .on("end", process.exit);
        csvStream.on('error', function(err){ console.log(err); });
      }
      // Let client wait until start flag turns 1
      // the clock for the waiting room starts when the first client pops in.
      if (roomStatus[client.room]['n']===1) {
        let now = new Date(),
            logdate = '[' + now.getUTCFullYear() + '/' + (now.getUTCMonth() + 1) + '/';
        let doneNum;
        logdate += now.getUTCDate() + '/' + now.getUTCHours() + ':' + now.getUTCMinutes() + ':' + now.getUTCSeconds() + ']';
        console.log(logdate + ' - The first participant came in to the room ' + client.room + '.');
        startWaitingStageClock(client.room);
      }
      // inform rest time to the room
      io.to(client.room).emit('this is the remaining waiting time', {restTime:roomStatus[client.room]['restTime'], max:MAX_WAITING_TIME, MAX_NUM_PLAYER:MAX_NUM_PLAYER, maxRound:NUM_TRIAL});
    }
  });
  
  client.on('choice made', function (data) {
    let now = new Date(),
        logdate = '[' + now.getUTCFullYear() + '/' + (now.getUTCMonth() + 1) + '/';
    let doneNum;
    let timeElapsed = now - firstTrialStartingTime;
    //let chocieArray = eval('['+data.choice+']');
    logdate += now.getUTCDate() + '/' + now.getUTCHours() + ':' + now.getUTCMinutes() + ':' + now.getUTCSeconds() + ']';
    console.log(logdate + ' - Client ' + client.session + '(subNo = ' + client.subjectNumber + ') chose ' + data.choice + ' and got ' + data.payoff + '.');
    if (typeof roomStatus[client.room]['socialInfo'][roomStatus[client.room]['round'] - 1] !== 'undefined') {
      roomStatus[client.room]['doneId'][roomStatus[client.room]['round']-1].push(client.subjectNumber);
      doneNum = roomStatus[client.room]['doneId'][roomStatus[client.room]['round']-1].length;
      roomStatus[client.room]['socialInfo'][roomStatus[client.room]['round']-1][doneNum-1] = data.choice;
      roomStatus[client.room]['publicInfo'][roomStatus[client.room]['round']-1][doneNum-1] = data.payoff;
      roomStatus[client.room]['choiceOrder'][roomStatus[client.room]['round']-1][doneNum-1] = client.subjectNumber;
      //client.emit('your instant number is ', client.subjectNumber-1);
      io.to(client.room).emit('these are done subjects', {doneSubject:roomStatus[client.room]['doneId'][roomStatus[client.room]['round']-1]});
      // save data to mongodb
      let behaviour = new Behaviour();
      behaviour.date = now.getUTCFullYear() + '-' + (now.getUTCMonth() + 1) +'-' + now.getUTCDate();
      behaviour.time = now.getUTCHours()+':'+now.getUTCMinutes()+':'+now.getUTCSeconds();
      behaviour.expCondition = roomStatus[client.room]['EXP_CONDITION'];
      behaviour.indivOrGroup = roomStatus[client.room]['indivOrGroup'];
      behaviour.groupSize = roomStatus[client.room]['n'];
      behaviour.room = client.room;
      behaviour.confirmationID = client.session;
      behaviour.subjectNumber = client.subjectNumber;
      behaviour.amazonID = client.amazonID;
      behaviour.payoffLandscape = client.landscapeId;
      behaviour.round = roomStatus[client.room]['round'];
      behaviour.choice = data.choice;
      behaviour.payoff = data.payoff;
      behaviour.totalEarning = data.totalEarning;
      behaviour.behaviouralType = 'choice';
      behaviour.timeElapsed = timeElapsed;
      behaviour.latency = client.latency;
      let dummyInfo0 = new Array(MAX_NUM_PLAYER).fill(-1);
      for(let i=0; i<MAX_NUM_PLAYER; i++) {
        eval('behaviour.socialInfo_'+i+'= dummyInfo0['+i+'];');
      }
      for(let i=0; i<MAX_NUM_PLAYER; i++) {
        eval('behaviour.publicInfo_'+i+'= dummyInfo0['+i+'];');
      }
      
      if(behaviour.round>1){
        for(let i = 0; i < data.socialInfo.length; i++) {
          eval('behaviour.socialInfo_'+i+'= data.socialInfo['+i+'];');
          eval('behaviour.publicInfo_'+i+'= data.publicInfo['+i+'];');
        }
      }
      //console.log(behaviour);
      behaviour.save(function(err){
        if(err) console.log(err);
        console.log("behaviour saved");
      });

      // Save the data to csv
      let save_data = new Object();
      save_data.EXP_CONDITION = roomStatus[client.room]['EXP_CONDITION'];
      save_data.indivOrGroup = roomStatus[client.room]['indivOrGroup'];
      save_data.groupSize = roomStatus[client.room]['n'];
      save_data.room = client.room;
      save_data.confirmationID = client.session;
      save_data.subjectNumber = client.subjectNumber;
      save_data.amazonID = client.amazonID;
      save_data.payoffLandscape = client.landscapeId;
      save_data.round = roomStatus[client.room]['round'];
      save_data.choice = data.choice;
      save_data.payoff = data.payoff;
      save_data.totalEarning = data.totalEarning;
      //save_data.individualContribution = data.individualContribution;
      let dummyInfo = new Array(MAX_NUM_PLAYER).fill(-1);
      for(let i=0; i<MAX_NUM_PLAYER; i++) {
        eval('save_data.socialInfo_'+i+'= dummyInfo['+i+'];');
      }
      for(let i=0; i<MAX_NUM_PLAYER; i++) {
        eval('save_data.publicInfo_'+i+'= dummyInfo['+i+'];');
      }
      
      if(save_data.round>1){
        for(let i = 0; i < data.socialInfo.length; i++) {
          eval('save_data.socialInfo_'+i+'= data.socialInfo['+i+'];');
          eval('save_data.publicInfo_'+i+'= data.publicInfo['+i+'];');
        }
      }
      csvStream.write(save_data);

    } else {
      roomStatus[client.room]['choiceOrder'][roomStatus[client.room]['round']-1] = new Array(MAX_NUM_PLAYER).fill(-1);
      roomStatus[client.room]['socialInfo'][roomStatus[client.room]['round']-1] = new Array(MAX_NUM_PLAYER).fill(-1);
      roomStatus[client.room]['publicInfo'][roomStatus[client.room]['round']-1] = new Array(MAX_NUM_PLAYER).fill(-1);
      roomStatus[client.room]['doneId'][roomStatus[client.room]['round']-1] = [client.subjectNumber];
      roomStatus[client.room]['socialInfo'][roomStatus[client.room]['round']-1][0] = data.choice;
      roomStatus[client.room]['publicInfo'][roomStatus[client.room]['round']-1][0] = data.payoff;
      roomStatus[client.room]['choiceOrder'][roomStatus[client.room]['round']-1][0] = client.subjectNumber;
      io.to(client.room).emit('these are done subjects', {doneSubject:roomStatus[client.room]['doneId'][roomStatus[client.room]['round']-1]});

      // save data to mongodb
      let behaviour = new Behaviour();
      behaviour.date = now.getUTCFullYear() + '-' + (now.getUTCMonth() + 1) +'-' + now.getUTCDate();
      behaviour.time = now.getUTCHours()+':'+now.getUTCMinutes()+':'+now.getUTCSeconds();
      behaviour.expCondition = roomStatus[client.room]['EXP_CONDITION'];
      behaviour.indivOrGroup = roomStatus[client.room]['indivOrGroup'];
      behaviour.groupSize = roomStatus[client.room]['n'];
      behaviour.room = client.room;
      behaviour.confirmationID = client.session;
      behaviour.subjectNumber = client.subjectNumber;
      behaviour.amazonID = client.amazonID;
      behaviour.payoffLandscape = client.landscapeId;
      behaviour.round = roomStatus[client.room]['round'];
      behaviour.choice = data.choice;
      behaviour.payoff = data.payoff;
      behaviour.totalEarning = data.totalEarning;
      behaviour.behaviouralType = 'choice';
      behaviour.timeElapsed = timeElapsed;
      behaviour.latency = client.latency;
      let dummyInfo0 = new Array(MAX_NUM_PLAYER).fill(-1);
      for(let i=0; i<MAX_NUM_PLAYER; i++) {
        eval('behaviour.socialInfo_'+i+'= dummyInfo0['+i+'];');
      }
      for(let i=0; i<MAX_NUM_PLAYER; i++) {
        eval('behaviour.publicInfo_'+i+'= dummyInfo0['+i+'];');
      }
      
      if(behaviour.round>1){
        for(let i = 0; i < data.socialInfo.length; i++) {
          eval('behaviour.socialInfo_'+i+'= data.socialInfo['+i+'];');
          eval('behaviour.publicInfo_'+i+'= data.publicInfo['+i+'];');
        }
      }
      //console.log(behaviour);
      behaviour.save(function(err){
        if(err) console.log(err);
        console.log("behaviour saved");
      });


      let save_data = new Object();
      save_data.EXP_CONDITION = roomStatus[client.room]['EXP_CONDITION'];
      save_data.indivOrGroup = roomStatus[client.room]['indivOrGroup'];
      save_data.groupSize = roomStatus[client.room]['n'];
      save_data.room = client.room;
      save_data.confirmationID = client.session;
      save_data.subjectNumber = client.subjectNumber;
      save_data.amazonID = client.amazonID;
      save_data.payoffLandscape = client.landscapeId;
      save_data.round = roomStatus[client.room]['round'];
      save_data.choice = data.choice;
      save_data.payoff = data.payoff;
      save_data.totalEarning = data.totalEarning;
      //save_data.individualContribution = data.individualContribution;
      let dummyInfo = new Array(MAX_NUM_PLAYER).fill(-1);
      for(let i=0; i<MAX_NUM_PLAYER; i++) {
        eval('save_data.socialInfo_'+i+'= dummyInfo['+i+'];');
      }
      for(let i=0; i<MAX_NUM_PLAYER; i++) {
        eval('save_data.publicInfo_'+i+'= dummyInfo['+i+'];');
      }
      
      if(save_data.round>1){
        for(let i = 0; i < data.socialInfo.length; i++) {
          eval('save_data.socialInfo_'+i+'= data.socialInfo['+i+'];');
          eval('save_data.publicInfo_'+i+'= data.publicInfo['+i+'];');
        }
      }
      csvStream.write(save_data);
      // save data - end
    }
    console.log(roomStatus[client.room]);
  });

  client.on('Result stage ended', function () {
    // Depending on the number of subject who has already done this round,
    // the response to the client changes 
    // (i.e., the next round only starts after all the subject at the moment have chosen their option)
    if (typeof roomStatus[client.room]['doneNo'][roomStatus[client.room]['round']-1] !== 'undefined') {
        roomStatus[client.room]['doneNo'][roomStatus[client.room]['round']-1]++;
    } else {
          // if 'doneNo' is still undefined, make it
        roomStatus[client.room]['doneNo'][roomStatus[client.room]['round']-1] = 1;
    }
    if (roomStatus[client.room]['doneNo'][roomStatus[client.room]['round']-1] >= roomStatus[client.room]['n']) {
      console.log(roomStatus[client.room]);
      proceedRound(client.room);
    }
  });

  client.on('ok individual condition sounds good', function () {
    // finally checking weather group is still below the maxnumber
    if(roomStatus[client.room]['n'] < MAX_NUM_PLAYER) {
      // the status of the client's former room is updated
      roomStatus[client.room]['starting'] = 1;
      roomStatus[client.room]['n']--;
      // create a new individual condition's room
      roomStatus[myMonth+myDate+myHour+myMin+'_sessionIndiv_' + (SESSION_NO + Object.keys(roomStatus).length - 1)] = 
      {
          EXP_CONDITION: EXP_CONDITION,
          indivOrGroup: 0,
          n: 0,
          membersID: [],
          subjectNumbers: [],
          disconnectedList: [],
          testPassed: 0,
          starting: 0,
          stage: 'firstWaiting',
          MAX_CHOICE_STAGE_TIME: MAX_CHOICE_STAGE_TIME,
          choiceTime: [],
          round: 1,
          doneId: [],
          doneNo: [],
          socialInfo:[],
          publicInfo:[],
          choiceOrder:[],
          saveDataThisRound: [],
          restTime:MAX_WAITING_TIME
      };
      // client leave the former room
      client.leave(client.room);
      // client joints the new individual room
      client.room = Object.keys(roomStatus)[Object.keys(roomStatus).length - 1];
      client.join(client.room);
      //num_Player++;
      roomStatus[client.room]['n']++
      roomStatus[client.room]['membersID'].push(client.session);
      client.subjectNumber = roomStatus[client.room]['n'];
      startSession(client.room);
    } else {
      // if groupSize reached the enough number
      startSession(client.room);
    }
  });

  client.on('test passed', function () {
    if (roomStatus[client.room]['testPassed']==0) {
      roomStatus[client.room]['stage'] = 'secondWaitingRoom';
    }
    roomStatus[client.room]['testPassed']++;
    console.log(client.session + ' passed the test.');
    if (roomStatus[client.room]['testPassed'] >= roomStatus[client.room]['n']) {
      console.log(client.room + ' is ready to start the game.');
      io.to(client.room).emit('all passed the test', {n:roomStatus[client.room]['n'], testPassed:roomStatus[client.room]['testPassed'], EXP_CONDITION:roomStatus[client.room]['EXP_CONDITION']});
    } else {
      client.emit('wait for others finishing test');
    }
  });

  client.on('the first trial started', function () {
    if(roomStatus[client.room]['starting'] != 2) {
      roomStatus[client.room]['starting'] = 2;
      firstTrialStartingTime = new Date();
    }
  });

  client.on('myIconTouchstart', function (data) {
    // save data to mongodb
    let now = new Date();
    let timeElapsed = now - firstTrialStartingTime;
    let behaviour = new Behaviour();
    behaviour.date = now.getUTCFullYear() + '-' + (now.getUTCMonth() + 1) +'-' + now.getUTCDate();
    behaviour.time = now.getUTCHours()+':'+now.getUTCMinutes()+':'+now.getUTCSeconds();
    behaviour.expCondition = roomStatus[client.room]['EXP_CONDITION'];
    behaviour.indivOrGroup = roomStatus[client.room]['indivOrGroup'];
    behaviour.groupSize = roomStatus[client.room]['n'];
    behaviour.room = client.room;
    behaviour.confirmationID = client.session;
    behaviour.subjectNumber = client.subjectNumber;
    behaviour.amazonID = client.amazonID;
    behaviour.payoffLandscape = client.landscapeId;
    behaviour.round = roomStatus[client.room]['round'];
    behaviour.choice = data.position;
    behaviour.payoff = '';
    behaviour.totalEarning = '';
    behaviour.behaviouralType = 'myIconTouchstart';
    behaviour.timeElapsed = timeElapsed;
    behaviour.latency = client.latency;
    let dummyInfo0 = new Array(MAX_NUM_PLAYER).fill(-1);
    for(let i=0; i<MAX_NUM_PLAYER; i++) {
      eval('behaviour.socialInfo_'+i+'= dummyInfo0['+i+'];');
    }
    for(let i=0; i<MAX_NUM_PLAYER; i++) {
      eval('behaviour.publicInfo_'+i+'= dummyInfo0['+i+'];');
    }
    //console.log(behaviour);
    behaviour.save(function(err){
      if(err) console.log(err);
      console.log("myIconTouchstart saved");
    });
  });

  client.on('myIconTouchend', function (data) {
    // save data to mongodb
    let now = new Date();
    let timeElapsed = now - firstTrialStartingTime;
    let behaviour = new Behaviour();
    behaviour.date = now.getUTCFullYear() + '-' + (now.getUTCMonth() + 1) +'-' + now.getUTCDate();
    behaviour.time = now.getUTCHours()+':'+now.getUTCMinutes()+':'+now.getUTCSeconds();
    behaviour.expCondition = roomStatus[client.room]['EXP_CONDITION'];
    behaviour.indivOrGroup = roomStatus[client.room]['indivOrGroup'];
    behaviour.groupSize = roomStatus[client.room]['n'];
    behaviour.room = client.room;
    behaviour.confirmationID = client.session;
    behaviour.subjectNumber = client.subjectNumber;
    behaviour.amazonID = client.amazonID;
    behaviour.payoffLandscape = client.landscapeId;
    behaviour.round = roomStatus[client.room]['round'];
    behaviour.choice = data.position;
    behaviour.payoff = '';
    behaviour.totalEarning = '';
    behaviour.behaviouralType = 'myIconTouchend';
    behaviour.timeElapsed = timeElapsed;
    behaviour.latency = client.latency;
    let dummyInfo0 = new Array(MAX_NUM_PLAYER).fill(-1);
    for(let i=0; i<MAX_NUM_PLAYER; i++) {
      eval('behaviour.socialInfo_'+i+'= dummyInfo0['+i+'];');
    }
    for(let i=0; i<MAX_NUM_PLAYER; i++) {
      eval('behaviour.publicInfo_'+i+'= dummyInfo0['+i+'];');
    }
    //console.log(behaviour);
    behaviour.save(function(err){
      if(err) console.log(err);
      console.log("myIconTouchend saved");
    });
  });

  client.on("disconnect", function () {
    let thisRoomName = client.room;
    client.leave(client.room);
    if(typeof thisRoomName == 'undefined') thisRoomName = 'finishedRoom';
    if (thisRoomName != 'finishedRoom') {
      num_Player--;
    }
    /*if(num_Player < 1 && typeof pingPong != 'undefined') {
      clearInterval(pingPong);
    }*/
    if(typeof roomStatus[thisRoomName] != 'undefined') {
      if(typeof roomStatus[thisRoomName]['disconnectedList'] != 'undefined') {
        roomStatus[thisRoomName]['disconnectedList'].push(client.session);
      }
      let idPosition;
      //let subjectNumberPosition;
      if(roomStatus[thisRoomName]['membersID'].indexOf(client.session) > -1) {
        idPosition = roomStatus[thisRoomName]['membersID'].indexOf(client.session);
      }
      /*if(roomStatus[thisRoomName]['subjectNumbers'].indexOf(client.subjectNumber) > -1) {
        subjectNumberPosition = roomStatus[thisRoomName]['membersID'].indexOf(client.subjectNumber);
      }*/
      roomStatus[thisRoomName]['membersID'].splice(idPosition, 1);
      roomStatus[thisRoomName]['subjectNumbers'].splice(idPosition, 1);
      sessionNameSpace[client.session] = 0;
      if(roomStatus[thisRoomName]['indivOrGroup'] != 0) {
        roomStatus[thisRoomName]['n']--;
        // Note: 
        // if this is an individual session's room, then I want 'n' to remain 1
        // so than no one will never enter this room again. 
        // On the other hand, it this is a group session's room, reducing 'n' may open up 
        // a room for a new comer (if this room is still on the first waiting screen)
      }
      let doneOrNot;
      if(typeof roomStatus[thisRoomName]['doneId'][roomStatus[thisRoomName]['round']-1] != 'undefined') {
        doneOrNot = roomStatus[thisRoomName]['doneId'][roomStatus[thisRoomName]['round']-1].indexOf(client.subjectNumber);
      } else {
        doneOrNot = -1;
      }
      if(doneOrNot > -1){
        roomStatus[thisRoomName]['doneId'][roomStatus[thisRoomName]['round']-1].splice(doneOrNot, 1);
        roomStatus[client.room]['socialInfo'][roomStatus[client.room]['round']-1].splice(doneOrNot, 1);
        roomStatus[client.room]['socialInfo'][roomStatus[client.room]['round']-1].push(-1);
      }
      io.to(thisRoomName).emit('client disconnected', {roomStatus:roomStatus[thisRoomName], disconnectedClient:client.id});
      
      
      
      if(roomStatus[thisRoomName]['n'] <= 0){
        stopAndResetClock(thisRoomName);
      }
      var now = new Date(),
        logdate = '['+now.getUTCFullYear()+'/'+(now.getUTCMonth()+1)+'/';
        logdate += now.getUTCDate()+'/'+now.getUTCHours()+':'+now.getUTCMinutes()+':'+now.getUTCSeconds()+']';
      console.log(logdate+' - client disconnected: '+ client.session+'('+client.amazonID+')'+' (room N: '+roomStatus[thisRoomName]['n']+', total N: '+num_Player+') - handshakeID:'+ client.session);
      if (thisRoomName != 'finishedRoom' && num_Player===0 && typeof csvStream != 'undefined') {
        csvStream.end();
      }
    }
    //console.log(roomStatus[thisRoomName]);
  });

  // monitoring client's latency
  /*client.on('pong', function() {
    let now = Date.now();
    pingPongCalculation(now, pingTime, client);
    //pingPondDiff[client.id] = Date.now() - pingTime;
    //client.emit('pong', {pingPondDiffList: pingPondDiff});
    //console.log('receiving pong from ' + client.session);
  });*/

});


function rand(max, min = 0) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

function proceedRound (room) {
  roomStatus[room]['round']++;
  if(roomStatus[room]['round'] <= NUM_TRIAL) {
    ////console.log(roomStatus[room]['round']);
    //console.log(NUM_TRIAL);
    io.to(room).emit('Proceed to next round', roomStatus[room]);
    // save data to mongodb
    let now = new Date();
    let logdate = '['+now.getUTCFullYear()+'/'+(now.getUTCMonth()+1)+'/';
    logdate += now.getUTCDate()+'/'+now.getUTCHours()+':'+now.getUTCMinutes()+':'+now.getUTCSeconds()+']';
    let behaviour = new Behaviour();
    behaviour.date = now.getUTCFullYear() + '-' + (now.getUTCMonth() + 1) +'-' + now.getUTCDate();
    behaviour.time = now.getUTCHours()+':'+now.getUTCMinutes()+':'+now.getUTCSeconds();
    behaviour.expCondition = roomStatus[room]['EXP_CONDITION'];
    behaviour.indivOrGroup = roomStatus[room]['indivOrGroup'];
    behaviour.groupSize = roomStatus[room]['n'];
    behaviour.room = room;
    behaviour.confirmationID = '';
    behaviour.subjectNumber = '';
    behaviour.amazonID = '';
    behaviour.payoffLandscape = '';
    behaviour.round = roomStatus[room]['round'];
    behaviour.choice = '';
    behaviour.payoff = '';
    behaviour.totalEarning = '';
    behaviour.behaviouralType = 'transition';
    let dummyInfo0 = new Array(MAX_NUM_PLAYER).fill(-1);
    for(let i=0; i<MAX_NUM_PLAYER; i++) {
      eval('behaviour.socialInfo_'+i+'= dummyInfo0['+i+'];');
    }
    for(let i=0; i<MAX_NUM_PLAYER; i++) {
      eval('behaviour.publicInfo_'+i+'= dummyInfo0['+i+'];');
    }
    behaviour.save(function(err){
      if(err) console.log(err);
      console.log(logdate + " behaviour data (behaviouralType = 'transition') was saved.");
    });
  } else {
    io.to(room).emit('End this session', roomStatus[room]);
  }
}

function countDown(room) {
  //console.log('rest time of ' + room + ' is ' + roomStatus[room]['restTime']);
  roomStatus[room]['restTime'] -= 500;
  if (roomStatus[room]['restTime'] < 0) {
    //setTimeout(function(){ startSession(room) }, 1500); // this delay allows the 'start' text's effect
    if(roomStatus[room]['n'] < 2 && roomStatus[room]['indivOrGroup'] != 0) {
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
  if (roomStatus[room]['n'] < 2) {
    roomStatus[room]['indivOrGroup'] = 0; // individual condition
  } else {
    roomStatus[room]['indivOrGroup'] = 1; // group condition
  }
  io.to(room).emit('this room gets started', {room:room, n:roomStatus[room]['n'], EXP_CONDITION:roomStatus[room]['EXP_CONDITION'], indivOrGroup:roomStatus[room]['indivOrGroup']});
  var now = new Date(),
      logdate = '['+now.getUTCFullYear()+'/'+(now.getUTCMonth()+1)+'/';
      logdate += now.getUTCDate()+'/'+now.getUTCHours()+':'+now.getUTCMinutes()+':'+now.getUTCSeconds()+']';
  console.log(logdate+' - session started in '+room);
  //startChoiceStage(room, 1);
  //setTimeout(function(){ startChoiceStage(room, 1) }, 500);
}

function startWaitingStageClock (room) {
    var now = new Date(),
        logtxt = '['+now.getUTCFullYear()+'/'+(now.getUTCMonth()+1)+'/';
        logtxt += now.getUTCDate()+'/'+now.getUTCHours()+':'+now.getUTCMinutes()+':'+now.getUTCSeconds()+']';
        logtxt += ' - Waiting room opened at '+ room;
    console.log(logtxt);
    countDown(room);
}

function stopAndResetClock (room) {
  clearTimeout(countDownWaiting[room]);
  roomStatus[room]['restTime'] = MAX_WAITING_TIME;
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
