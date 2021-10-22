'use strict';

/* ========================================
	Functions
=========================================== */

// randomly choosing an integer between min and max
export function rand(max, min = 0) {
    return Math.floor(Math.random() * (max - min + 1) + min);
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

export function debug_pointerdown (x, y) {
	socket.emit('debug pointerdown!', {x: x, y: y});
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

export function testFunction (x, y, this_game) {
	console.log('dude was clicked at x = '+x + '; y = '+y);
	this_game.game.scene.start('SceneFeedback');
	this_game.game.scene.sleep('SceneDebugEnv');
}

export function debug_pointerdown_feedback (this_game) {
	this_game.game.scene.wake('SceneDebugEnv');
	this_game.game.scene.sleep('SceneFeedback');
}






