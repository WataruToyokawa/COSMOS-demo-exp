'use strict';

import {maxLatencyForGroupCondition
    , num_cell
	, socket
	, cell_size_x
	, cell_size_y
	, COLOR_PRIMARY_TEXTBOX
	, COLOR_LIGHT_TEXTBOX
	, COLOR_DARK_TEXTBOX
	, field_x_floor
	, field_y_floor
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

export function shuffleArray (inputArray) {
    inputArray.sort(()=> Math.random() - 0.5);
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

export function play_arm (x, y, num_cell, optionOrder, this_game, this_trial_num, condition = 'individual', n_in_the_cell = 1, isTimeout = false) {
	let clicked_box_position = (x + num_cell * (y-1));
	let box_quality = optionOrder[clicked_box_position - 1];
	let payoff = BoxMuller(50+box_quality*10, 5);

	if (condition == 'competitive') {
		payoff = Math.round(payoff / n_in_the_cell);
	} else {
		payoff = Math.round(payoff);
	}

	// console.log('dude was clicked at x = '+x + '; y = '+y+' and payoff is '+payoff);
	socket.emit('play_arm', 
		{clicked_box_position: clicked_box_position
		, box_quality:box_quality
		, payoff:payoff
		, this_trial_num:this_trial_num
		, condition: condition
		}); // emitting the choice made to the server
	
	this_game.player.removeInteractive();
	this_game.player.clearTint();
	this_game.game.scene.start('SceneFeedback', {payoff:payoff, x:x, y:y, clicked_box_position:clicked_box_position, box_quality:box_quality, this_trial_num:this_trial_num, isTimeout:false});
	if (typeof this_game.game.scene.keys.SceneDebugPopup.popup != 'undefined') this_game.game.scene.keys.SceneDebugPopup.popup.visible = false;
	if (indivOrGroup == 0) {
		this_game.game.scene.keys.SceneDemoIndiv.player.visible = false;
		this_game.game.scene.keys.SceneDemoIndiv.player.removeInteractive();
		for (let i = 1; i < num_cell+1; i++) {
			for (let j = 1; j < num_cell+1; j++) {
				this_game.game.scene.keys.SceneDemoIndiv.options['box'+i+j].removeInteractive();
			}
		}
	} else {
		this_game.game.scene.keys.SceneDemoGroup.isSceneDemoGroupActive = false;
		this_game.game.scene.keys.SceneDemoGroup.player.visible = false;
		this_game.game.scene.keys.SceneDemoGroup.player.removeInteractive();
		for (let i = 1; i < num_cell+1; i++) {
			for (let j = 1; j < num_cell+1; j++) {
				this_game.game.scene.keys.SceneDemoGroup.options['box'+i+j].removeInteractive();
			}
		}
		for (let i = 0; i < maxGroupSize; i++) {
			other_player_array[i].visible = false;
		}
		// remove timer object
		this_game.game.scene.keys.SceneDemoGroup.energyContainer.visible = false;
		this_game.game.scene.keys.SceneDemoGroup.energyBar.visible = false;
	}

	this_game.gameTimer.destroy(); // stop the timer
	this_game.energyMask.x = this_game.energyBar.x // reset the countdown bar length
}

export function play_arm_competitive (x, y, num_cell, optionOrder, this_game, this_trial_num, condition = 'competitive', n_in_the_cell = 1, isTimeout = false) {
	let clicked_box_position = (x + num_cell * (y-1));
	let box_quality = optionOrder[clicked_box_position - 1];
	let payoff = BoxMuller(50+box_quality*10, 5);

	payoff = Math.round(payoff / n_in_the_cell);

	this_game.game.scene.stop('SceneFeedback');
	this_game.game.scene.start('SceneFeedback', {payoff:payoff, x:x, y:y, clicked_box_position:clicked_box_position, box_quality:box_quality, this_trial_num:this_trial_num, isTimeout:false});

	// console.log('dude was clicked at x = '+x + '; y = '+y+' and payoff is '+payoff);
	socket.emit('play_arm', 
		{clicked_box_position: clicked_box_position
		, box_quality:box_quality
		, payoff:payoff
		, this_trial_num:this_trial_num
		, condition: condition
		}); 
	
	if(currentTrial >= horizon) {
		setTimeout(function(){
			socket.emit('completed all trial in the competitive task')
		}, 1.3 * 1000);
	}
	
	// // if itTimeout is true, make everything invisible
	// if(isTimeout) {
	// 	this_game.player.removeInteractive();
	// 	this_game.player.clearTint();
	// 	this_game.game.scene.start('SceneFeedback', {payoff:-1, x:x, y:y, clicked_box_position:clicked_box_position, box_quality:box_quality, this_trial_num:this_trial_num, isTimeout:false});
	// 	if (typeof this_game.game.scene.keys.SceneDebugPopup.popup != 'undefined') this_game.game.scene.keys.SceneDebugPopup.popup.visible = false;
	// 	if (indivOrGroup == 0) {
	// 		this_game.game.scene.keys.SceneDemoIndiv.player.visible = false;
	// 		this_game.game.scene.keys.SceneDemoIndiv.player.removeInteractive();
	// 		for (let i = 1; i < num_cell+1; i++) {
	// 			for (let j = 1; j < num_cell+1; j++) {
	// 				this_game.game.scene.keys.SceneDemoIndiv.options['box'+i+j].removeInteractive();
	// 			}
	// 		}
	// 	} else {
	// 		this_game.game.scene.keys.SceneDemoGroup.isSceneDemoGroupActive = false;
	// 		this_game.game.scene.keys.SceneDemoGroup.player.visible = false;
	// 		this_game.game.scene.keys.SceneDemoGroup.player.removeInteractive();
	// 		for (let i = 1; i < num_cell+1; i++) {
	// 			for (let j = 1; j < num_cell+1; j++) {
	// 				this_game.game.scene.keys.SceneDemoGroup.options['box'+i+j].removeInteractive();
	// 			}
	// 		}
	// 		for (let i = 0; i < maxGroupSize; i++) {
	// 			other_player_array[i].visible = false;
	// 		}
	// 		// remove timer object
	// 		this_game.game.scene.keys.SceneDemoGroup.energyContainer.visible = false;
	// 		this_game.game.scene.keys.SceneDemoGroup.energyBar.visible = false;
	// 	}

	// 	this_game.gameTimer.destroy(); // stop the timer
	// 	this_game.energyMask.x = this_game.energyBar.x // reset the countdown bar length
	// }

}

export function update_done_n (x, y, num_cell, optionOrder, this_game, this_trial_num) {
	let clicked_box_position = (x + num_cell * (y-1));
	let box_quality = optionOrder[clicked_box_position - 1];
	socket.emit('update_done_n', {clicked_box_position: clicked_box_position, box_quality:box_quality, this_trial_num:this_trial_num});
	// socket.emit('choice_is_made_in_competitive_cond');

	this_game.player.removeInteractive();
	this_game.player.clearTint();
	this_game.game.scene.start('SceneFeedback', {payoff:-1, x:x, y:y, clicked_box_position:clicked_box_position, box_quality:box_quality, this_trial_num:this_trial_num, isTimeout:false});
	if (typeof this_game.game.scene.keys.SceneDebugPopup.popup != 'undefined') this_game.game.scene.keys.SceneDebugPopup.popup.visible = false;
	if (indivOrGroup == 0) {
		this_game.game.scene.keys.SceneDemoIndiv.player.visible = false;
		this_game.game.scene.keys.SceneDemoIndiv.player.removeInteractive();
		for (let i = 1; i < num_cell+1; i++) {
			for (let j = 1; j < num_cell+1; j++) {
				this_game.game.scene.keys.SceneDemoIndiv.options['box'+i+j].removeInteractive();
			}
		}
	} else {
		this_game.game.scene.keys.SceneDemoGroup.isSceneDemoGroupActive = false;
		this_game.game.scene.keys.SceneDemoGroup.player.visible = false;
		this_game.game.scene.keys.SceneDemoGroup.player.removeInteractive();
		for (let i = 1; i < num_cell+1; i++) {
			for (let j = 1; j < num_cell+1; j++) {
				this_game.game.scene.keys.SceneDemoGroup.options['box'+i+j].removeInteractive();
			}
		}
		for (let i = 0; i < maxGroupSize; i++) {
			other_player_array[i].visible = false;
		}
		// remove timer object
		this_game.game.scene.keys.SceneDemoGroup.energyContainer.visible = false;
		this_game.game.scene.keys.SceneDemoGroup.energyBar.visible = false;
	}

	this_game.gameTimer.destroy(); // stop the timer
	this_game.energyMask.x = this_game.energyBar.x // reset the countdown bar length
}

export function wake_main_stage_up (game, indivOrGroup = 0) {
	// game.scene.wake('SceneDebugPopup');
	if (typeof game.scene.keys.SceneDebugPopup.popup != 'undefined') game.scene.keys.SceneDebugPopup.popup.visible = true;
	needATimer = true;
	needAFeedback = true;
	if (indivOrGroup == 0) {
		game.scene.keys.SceneDemoIndiv.energyContainer.visible = true;
		game.scene.keys.SceneDemoIndiv.energyBar.visible = true;
		game.scene.keys.SceneDemoIndiv.player.visible = true;
		game.scene.keys.SceneDemoIndiv.player.setInteractive();
		for (let i = 1; i < num_cell+1; i++) {
			for (let j = 1; j < num_cell+1; j++) {
				game.scene.keys.SceneDemoIndiv.options['box'+i+j].setInteractive();
			}
		}
	} else {
		game.scene.keys.SceneDemoGroup.social_frequency.fill(1);
		game.scene.keys.SceneDemoGroup.energyContainer.visible = true;
		game.scene.keys.SceneDemoGroup.energyBar.visible = true;
		game.scene.keys.SceneDemoGroup.isSceneDemoGroupActive = true;
		game.scene.keys.SceneDemoGroup.player.visible = true;
		game.scene.keys.SceneDemoGroup.player.setInteractive();
		for (let i = 1; i < num_cell+1; i++) {
			for (let j = 1; j < num_cell+1; j++) {
				game.scene.keys.SceneDemoGroup.options['box'+i+j].setInteractive();
			}
		}
		for (let i = 0; i < maxGroupSize; i++) {
			other_player_array[i].visible = other_player_visibility_array[i];
		}
		game.scene.keys.SceneDemoGroup.energyContainer.visible = true;
		game.scene.keys.SceneDemoGroup.energyBar.visible = true;
	}
	game.scene.stop('SceneFeedback');
}

// export function go_to_summary_page (this_game, myChoices, myEarnings) {
// 	// this_game.game.scene.start('SceneResult', {myChoices:myChoices, myEarnings:myEarnings});
// 	// this_game.game.scene.stop('SceneFeedback');
// 	// console.log('go_to_summary_page is called');
// 	socket.emit('this_trial_is_done'); 
// }

export function emit_this_trial_is_done (this_game, indivOrGroup, currentTrial, horizon, myChoices, myEarnings, condition='individual') {
	if(condition != 'competitive') {
		setTimeout(function(){
			socket.emit('this_trial_is_done'); // emitting the choice made to the server
			// if (currentTrial < horizon) {
			// 	socket.emit('this_trial_is_done'); // emitting the choice made to the server
			// } else {
			// 	// go_to_summary_page(this_game, myChoices, myEarnings);
			// 	socket.emit('go_to_summary_page', {myChoices:myChoices, myEarnings:myEarnings});
			// }
		}, 1.3 * 1000); // 2.5s was the original
	} 
	// else {
	// 	// socket.emit('choice_is_made_in_competitive_cond');
	// }
}

export function countdownBarStarts (this_game, maxChoiceStageTime) {
	// console.log('countdownBarStarts is fired');
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
				// if (this_game.timeLeft < 0.5) {
				// 	// By setting "isChoiceMade" a bit earlier than
				// 	// the time is actually up, the two conflicting inputs, 
				// 	// a "miss" and an "actual choice" won't be executed at the same time
					
				// }
				// 
			if (this_game.timeLeft < 0) {
				if (!isChoiceMade) {
					isChoiceMade = true;
					let my_box_x = Math.ceil((this_game.player.x - field_x_floor)/cell_size_x)
					let my_box_y = Math.ceil((this_game.player.y - field_y_floor)/cell_size_y)
					let my_option = (my_box_x + num_cell * (my_box_y-1));
					if (condition != 'competitive') {
						play_arm(my_box_x
							, my_box_y
							, num_cell
							, optionOrder
							, this_game
							, currentTrial
							, condition
							, 1 // social frequency == 1 when it's not competitive condition
							, true // isTimeout
						); 
					} 
					else {
						update_done_n(my_box_x, my_box_y, num_cell, optionOrder, this_game, currentTrial)
					}
				}
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

const GetValue = Phaser.Utils.Objects.GetValue;
export function createTextBox (scene, x, y, config) {
    var wrapWidth = GetValue(config, 'wrapWidth', 0);
    var fixedWidth = GetValue(config, 'fixedWidth', 0);
    var fixedHeight = GetValue(config, 'fixedHeight', 0);
    var textBox = scene.rexUI.add.textBox({
            x: x,
            y: y,

            background: CreateSpeechBubbleShape(scene, COLOR_PRIMARY_TEXTBOX, COLOR_LIGHT_TEXTBOX),

            icon: scene.rexUI.add.roundRectangle(0, 0, 2, 2, 20, COLOR_DARK_TEXTBOX),

            // text: getBuiltInText(scene, wrapWidth, fixedWidth, fixedHeight),
            text: getBBcodeText(scene, wrapWidth, fixedWidth, fixedHeight),

            //action: scene.add.image(0, 0, 'nextPage').setTint(COLOR_LIGHT).setVisible(false),

        space: {
            left: 10, right: 10, top: 10, bottom: 25,
            icon: 10,
            text: 10,
        }
        })
        .setOrigin(0, 0.5)
        .layout();

    // textBox
    //     .setInteractive()
    //     .on('pointerdown', function () {
    //         var icon = this.getElement('action').setVisible(false);
    //         this.resetChildVisibleState(icon);
    //         if (this.isTyping) {
    //             this.stop(true);
    //         } else {
    //             this.typeNextPage();
    //         }
    //     }, textBox)
    //     .on('pageend', function () {
    //         if (this.isLastPage) {
    //             return;
    //         }

    //         var icon = this.getElement('action').setVisible(true);
    //         this.resetChildVisibleState(icon);
    //         icon.y -= 30;
    //         var tween = scene.tweens.add({
    //             targets: icon,
    //             y: '+=30', // '+=100'
    //             ease: 'Bounce', // 'Cubic', 'Elastic', 'Bounce', 'Back'
    //             duration: 500,
    //             repeat: 0, // -1: infinity
    //             yoyo: false
    //         });
    //     }, textBox)
    // //.on('type', function () {
    // //})

    return textBox;
}

export function getBuiltInText (scene, wrapWidth, fixedWidth, fixedHeight) {
    return scene.add.text(0, 0, '', {
            fontSize: '20px',
            wordWrap: {
                width: wrapWidth
            },
            maxLines: 3
        })
        .setFixedSize(fixedWidth, fixedHeight);
}

export function getBBcodeText (scene, wrapWidth, fixedWidth, fixedHeight) {
    return scene.rexUI.add.BBCodeText(0, 0, '', {
        fixedWidth: fixedWidth,
        fixedHeight: fixedHeight,

        fontSize: '20px',
        wrap: {
            mode: 'word',
            width: wrapWidth
        },
        maxLines: 3
    })
}

export function CreateSpeechBubbleShape (scene, fillColor, strokeColor) {
    return scene.rexUI.add.customShapes({
        create: { lines: 1 },
        update: function () {
            var radius = 20;
            var indent = 15;

            var left = 0, right = this.width,
                top = 0, bottom = this.height, boxBottom = bottom - indent;
            this.getShapes()[0]
                .lineStyle(2, strokeColor, 1)
                .fillStyle(fillColor, 1)
                // top line, right arc
                .startAt(left + radius, top).lineTo(right - radius, top).arc(right - radius, top + radius, radius, 270, 360)
                // right line, bottom arc
                .lineTo(right, boxBottom - radius).arc(right - radius, boxBottom - radius, radius, 0, 90)
                // bottom indent                    
                .lineTo(left + 60, boxBottom).lineTo(left + 50, bottom).lineTo(left + 40, boxBottom)
                // bottom line, left arc
                .lineTo(left + radius, boxBottom).arc(left + radius, boxBottom - radius, radius, 90, 180)
                // left line, top arc
                .lineTo(left, top + radius).arc(left + radius, top + radius, radius, 180, 270)
                .close();

        }
    })
}
