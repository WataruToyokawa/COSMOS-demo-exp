'use strict';

import {maxLatencyForGroupCondition
    , num_cell
	, socket
	, cell_size_x
	, cell_size_y
} from './global_const_values.js';

/* ========================================
	Functions
=========================================== */

// randomly choosing an integer between min and max (min and max are NOT included)
export function rand(max, min = 0) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}
// randomly choosing an integer, with both the maximum and minimum included
export function getRandomIntInclusive(max, min = 0) {
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min + 1)) + min; 
}

//
export function isNotNegative (element) {
	return element >= 0;
}

/**
	Box-Muller Method
	pseudo normal distribution (http://d.hatena.ne.jp/iroiro123/20111210/1323515616)
	@param number m: mean μ
	@param number sigma: variance = σ^2
	@return number generated
	Box-Muller Method
*/
export function BoxMuller(m, sigma) {
	let a = 1 - Math.random();
	let b = 1 - Math.random();
	let c = Math.sqrt(-2 * Math.log(a));
	if (0.5 - Math.random() > 0) {
		return c * Math.sin(Math.PI * 2 * b) * sigma + m;
	} else {
		return c * Math.cos(Math.PI * 2 * b) * sigma + m;
	}
};

// Sum of all elements of the array
export function sum (arr, fn) {
	if (fn) {
		return sum(arr.map(fn));
	}
	else {
		return arr.reduce(function(prev, current, i, arr) {
			return prev+current;
		});
	}
};

export function waitingBarCompleted () {
	//console.log('waitingBarCompleted is fired');
}

export function emit_move_avatar (x, y) {
	socket.emit('move_avatar', {x: x, y: y});
}

export function move_other_player (this_game, this_scene, subjectNumber, x, y) {
	// 
}

export function sending_core_is_ready (isPreloadDone) {
	if (isPreloadDone) {
		socket.emit('core is ready', {latency: 0, maxLatencyForGroupCondition: maxLatencyForGroupCondition});
		// console.log('emitting "core is ready" to the server');
	}
}

export function goToQuestionnaire () {
	////console.log('goToQuestionnaire()');
	$("#form").submit();
}

export function settingConfirmationID (id) {
	$("#confirmationID").val(id);
}

export function play_arm (x, y, num_cell, optionOrder, this_game, this_trial_num) {
	let clicked_box_position = (x + num_cell * (y-1));
	let box_quality = optionOrder[clicked_box_position - 1];
	let payoff = BoxMuller(50+box_quality*10, 5);
	payoff = Math.round(payoff);
	
	// console.log('dude was clicked at x = '+x + '; y = '+y+' and payoff is '+payoff);
	socket.emit('play_arm', {clicked_box_position: clicked_box_position, box_quality:box_quality, payoff:payoff}); // emitting the choice made to the server
	
	this_game.player.removeInteractive();
	this_game.player.clearTint();
	this_game.game.scene.start('SceneFeedback', {payoff:payoff, clicked_box_position:clicked_box_position, box_quality:box_quality, this_trial_num:this_trial_num});
	// this_game.game.scene.sleep('SceneDebugEnv');
	if (indivOrGroup == 0) {
		this_game.game.scene.sleep('SceneDemoIndiv');
	} else {
		this_game.game.scene.sleep('SceneDemoGroup');
	}
	this_game.gameTimer.destroy(); // stop the timer
	this_game.energyMask.x = this_game.energyBar.x // reset the countdown bar length
}

export function wake_main_stage_up (game, indivOrGroup = 0) {
	if (indivOrGroup == 0) {
		game.scene.wake('SceneDemoIndiv');
		needATimer = true;
		needAFeedback = true;
	} else {
		game.scene.wake('SceneDemoGroup');
		needATimer = true;
		needAFeedback = true;
	}
	game.scene.stop('SceneFeedback');
}

// export function go_to_summary_page (this_game, myChoices, myEarnings) {
// 	// this_game.game.scene.start('SceneResult', {myChoices:myChoices, myEarnings:myEarnings});
// 	// this_game.game.scene.stop('SceneFeedback');
// 	// console.log('go_to_summary_page is called');
// 	socket.emit('this_trial_is_done'); 
// }

export function emit_this_trial_is_done (this_game, indivOrGroup, currentTrial, horizon, myChoices, myEarnings) {
	setTimeout(function(){
		socket.emit('this_trial_is_done'); // emitting the choice made to the server
		// if (currentTrial < horizon) {
		// 	socket.emit('this_trial_is_done'); // emitting the choice made to the server
		// } else {
		// 	// go_to_summary_page(this_game, myChoices, myEarnings);
		// 	socket.emit('go_to_summary_page', {myChoices:myChoices, myEarnings:myEarnings});
		// }
	}, 2.5 * 1000); // 2.5s was the original
}

export function countdownBarStarts (this_game, maxChoiceStageTime) {
	console.log('countdownBarStarts is fired');
	this_game.timeLeft = maxChoiceStageTime / 1000;
	// a boring timer object. 
	this_game.gameTimer = this_game.time.addEvent({
		delay: 1000,
		callback: function(){
			this_game.timeLeft --;
			// dividing energy bar width by the number of seconds gives us the amount
			// of pixels we need to move the energy bar each second
			let stepWidth = this_game.energyMask.displayWidth / (maxChoiceStageTime/1000);
			// moving the mask
			this_game.energyMask.x -= stepWidth;
			if (this_game.timeLeft < 1) {
				// By setting "isChoiceMade" a bit earlier than
				// the time is actually up, the two conflicting inputs, 
				// a "miss" and an "actual choice" won't be executed at the same time
				isChoiceMade = true;
			}
			// 
			if(this_game.timeLeft < 0){
				play_arm(Math.ceil(this_game.player.x/cell_size_x), Math.ceil(this_game.player.y/cell_size_y), num_cell, optionOrder, this_game); 
				// game.scene.start('ScenePayoffFeedback', {didMiss: true, flag: currentChoiceFlag});
				// this_game.gameTimer.destroy();
			}
		},
		callbackScope: this_game,
		loop: true
	});
}



// export function show_result_plot () {
// 	let result = new CanvasJS.Chart("chartContainer", {
// 		animationEnabled: true,
// 		theme: "light2",
// 		title:{
// 			text: "Simple Line Chart"
// 		},
// 		data: [{        
// 			type: "line",
// 			  indexLabelFontSize: 16,
// 			dataPoints: [
// 				JSON.stringify(this.myChoices)
// 			]
// 		}]
// 	});
// 	result.render();
// }


