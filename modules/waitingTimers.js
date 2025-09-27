'use strict';
// modules/paramEmitter.js

function startWaitingStageClock(room, io, config, countDownWaiting, startSession, countDown) {
  console.log(' - Waiting room opened at ' + room);

  config.roomStatus[room]['restTime'] -= 500;

  if (config.roomStatus[room]['restTime'] < 0) {
    if (
      config.roomStatus[room]['n'] < config.minGroupSize &&
      config.roomStatus[room]['indivOrGroup'] !== 0
    ) {
      config.roomStatus[room]['starting'] = 1;
      io.to(room).emit('you guys are individual condition');
    } else {
      startSession(room, config, io, countDownWaiting);
    }
  } else {
    const room2 = room;
    countDownWaiting[room] = setTimeout(() => countDown(room2, config, io, countDownWaiting), 500);
  }
}

// function countDown(room) {
// 	//console.log('rest time of ' + room + ' is ' + config.roomStatus[room]['restTime']);
// 	config.roomStatus[room]['restTime'] -= 500;
// 	if (config.roomStatus[room]['restTime'] < 0) {
// 	//setTimeout(function(){ startSession(room) }, 1500); // this delay allows the 'start' text's effect
// 	if(config.roomStatus[room]['n'] < config.minGroupSize && config.roomStatus[room]['indivOrGroup'] != 0) {
// 	 	config.roomStatus[room]['starting'] = 1;
// 	  	io.to(room).emit('you guys are individual condition');
// 	} else {
// 	  	startSession(room);
// 	}
// 	//clearTimeout(countDownWaiting[room]);
// 	} else {
// 		let room2 = room;
// 		countDownWaiting[room] = setTimeout(function(){ countDown(room2) }, 500);
// 	}
// }

module.exports = { startWaitingStageClock };
