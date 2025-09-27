'use strict';
// modules/sessionManager.js

// const config = require('../config/constants'); 

function countDown(room, config, io, countDownWaiting) {
	//console.log('rest time of ' + room + ' is ' + config.roomStatus[room]['restTime']);
	config.roomStatus[room]['restTime'] -= 500;
	if (config.roomStatus[room]['restTime'] < 0) {
	//setTimeout(function(){ startSession(room) }, 1500); // this delay allows the 'start' text's effect
	if(config.roomStatus[room]['n'] < config.minGroupSize && config.roomStatus[room]['indivOrGroup'] != 0) {
	 	config.roomStatus[room]['starting'] = 1;
	  	io.to(room).emit('you guys are individual condition');
	} else {
	  	startSession(room, config, io, countDownWaiting);
	}
	//clearTimeout(countDownWaiting[room]);
	} else {
		let room2 = room;
		countDownWaiting[room] = setTimeout(function(){ countDown(room2, config, io, countDownWaiting) }, 500);
	}
}

function startSession (room, config, io, countDownWaiting) {
	if(typeof countDownWaiting[room] != 'undefined') {
		clearTimeout(countDownWaiting[room]);
	}
	config.roomStatus[room]['starting'] = 1;
	if (config.roomStatus[room]['n'] < config.minGroupSize) {
		config.roomStatus[room]['indivOrGroup'] = 0; // individual condition
	} else {
		config.roomStatus[room]['indivOrGroup'] = 1; // group condition
	}
	io.to(room).emit('this room gets started', 
		{room: room
		, n: config.roomStatus[room]['n']
		, exp_condition: config.roomStatus[room]['exp_condition']
		, indivOrGroup: config.roomStatus[room]['indivOrGroup']
		, optionOrder: config.roomStatus[room]['optionOrder']
		, maxChoiceStageTime: config.maxChoiceStageTime
		, taskOrder: config.roomStatus[room]['taskOrder'] 
	});
	console.log(' - session started in '+room);
}


module.exports = { countDown, startSession };
