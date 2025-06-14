/*

COSMOS demo -- a multi-armed bandit problem 
Author: Wataru Toyokawa (wataru.toyokawa@uni-konstanz.de)
24 April 2022

This file is taking care of the following things:

1. The main scene of the group (multi-player) condition of the demo task

*/
'use strict';

import {fieldHeight
	, fieldWidth
	, cell_size_x
	, cell_size_y
	, num_cell
	, field_x_floor
	, field_y_floor
} from './global_const_values.js';

import {emit_move_avatar
	, play_arm
	, countdownBarStarts
	, getRandomIntInclusive
	, update_done_n
} from './functions.js';

class SceneDemoGroup extends Phaser.Scene {

	constructor (){
	    super({ key: 'SceneDemoGroup', active: false });
	}

	preload(){
	}

	create(){
		// --- background colour ---
		this.cameras.main.setBackgroundColor('#FFFFFF'); //#FFFFFF == 'white' #99ccff == blue-ish
		// this.add.image(0, 0, 'fishhook_background').setOrigin(0, 0).setScale(0.75); // .setOrigin(1, 1) if u want rigt-btm

		// --- history window ---
		// let historyText = this.add.text(field_x_floor, fieldHeight + field_y_floor + 16, 'Total Score: 0', { fontSize: '25px', fill: '#000' });
		let historyText = this.add.text(field_x_floor, fieldHeight + field_y_floor + 16, 'Remaining clicks: ' + (horizon + 1 - currentTrial), { fontSize: '25px', fill: '#000' });
		this.historyText = historyText;

		// --- monitoring the activity of this stage ---
		let isSceneDemoGroupActive
		this.isSceneDemoGroupActive = isSceneDemoGroupActive
		this.isSceneDemoGroupActive = true

		// --- Creating options ---
		let options = {}
		this.options = options
		this.payoff_noise = payoff_noise
		for (let i = 1; i < num_cell+1; i++) {
			for (let j = 1; j < num_cell+1; j++) {
				// this.add.image(0, 0, 'Loewenbraeu_Logo.svg').setOrigin(0, 0).setScale(0.75);
				this.options['box'+i+j] = this.add.rectangle((i-1/2)*cell_size_x + field_x_floor, (j-1/2)*cell_size_y + field_y_floor, cell_size_x, cell_size_y);
				this.options['box'+i+j].setStrokeStyle(6, 0x1a65ac).setInteractive();
				// function
				this.options['box'+i+j].on('pointerover', function (pointer) {
					/* ====================================================================
						NOTE:
						Past rewards should be stored as a list
						Once such a list is ready, I should rewrite the following i and j
					=======================================================================*/
					// this.historyText.setText( 'You are in zone ' + (i + num_cell * (j-1)) );
					if(!isChoiceMade) this.scene.launch('SceneDebugPopup', {x: pointer.x - field_x_floor, y:pointer.y - field_y_floor});
				}, this);
			}
		}

		// --- Main player's objects ---
		let total_num_cell = num_cell * num_cell
		,	player_initial_potition = getRandomIntInclusive(total_num_cell - 1, 1)
		,	player_initial_x = (player_initial_potition % num_cell) * cell_size_x + cell_size_x/2 + field_x_floor
		,	player_initial_y = Math.floor(player_initial_potition / num_cell) * cell_size_y + cell_size_y/2 + field_y_floor
		;
		let player = this.physics.add.sprite(player_initial_x, player_initial_y, 'self_1');
		let target = new Phaser.Math.Vector2();
		this.target = target;
		this.player = player;
		// this.player.play('hovering-self').setInteractive({ cursor: 'pointer' });
		this.player.play('hovering-self');
		this.player.setScale(0.7);

		// --- Countdown timer ---
		// =============== A looking-good timer =================================
		this.energyContainer = this.add.sprite(100, fieldHeight + field_y_floor + 60, 'energycontainer'); // the energy container. 
		this.energyBar = this.add.sprite(this.energyContainer.x + 46, this.energyContainer.y, 'energybar'); // the energy bar. 
		// a copy of the energy bar to be used as a mask. Another simple sprite but...
		this.energyMask = this.add.sprite(this.energyBar.x, this.energyBar.y, 'energybar');
		// ...it's not visible...
		this.energyMask.visible = false;
		// resize them
		let energyContainer_originalWidth = this.energyContainer.displayWidth
		,	energyContainer_newWidth = 200
		,	container_bar_ratio = this.energyBar.displayWidth / this.energyContainer.displayWidth
		;
		this.energyContainer.displayWidth = energyContainer_newWidth;
		this.energyContainer.scaleY = this.energyContainer.scaleX;
		this.energyBar.displayWidth = energyContainer_newWidth * container_bar_ratio;
		this.energyBar.scaleY = this.energyBar.scaleX;
		this.energyBar.x = this.energyContainer.x + (46 * energyContainer_newWidth/energyContainer_originalWidth);
		this.energyMask.displayWidth = this.energyBar.displayWidth;
		this.energyMask.scaleY = this.energyMask.scaleX;
		this.energyMask.x = this.energyBar.x;
		// and we assign it as this.energyBar's mask.
		this.energyBar.mask = new Phaser.Display.Masks.BitmapMask(this, this.energyMask);
		needATimer = true;
		// =============== A looking-good timer =================================
		
		// --- What happens when click events fire ------
		this.input.on('pointerdown', function (pointer) {

			if (this.isSceneDemoGroupActive & !isChoiceMade) {

				if (pointer.x > field_x_floor & pointer.x < fieldWidth + field_x_floor) {
					this.target.x = Math.floor( (pointer.x - field_x_floor) / cell_size_x) * cell_size_x + cell_size_x / 2 + field_x_floor
				} else if (pointer.x <= field_x_floor) {
					this.target.x = cell_size_x / 2 + field_x_floor
				} else {
					this.target.x = Math.floor( fieldWidth / cell_size_x) * cell_size_x - cell_size_x / 2 + field_x_floor
				}

				if (pointer.y > field_y_floor & pointer.y < fieldHeight + field_y_floor) {
					this.target.y = Math.floor( (pointer.y - field_y_floor) / cell_size_y) * cell_size_y + cell_size_y / 2 + field_y_floor
				} else if (pointer.y <= field_y_floor) {
					this.target.y = cell_size_y / 2 + field_y_floor
				} else {
					this.target.y = Math.floor( fieldHeight / cell_size_y) * cell_size_y - cell_size_y / 2 + field_y_floor
				}

				// Move at 200 px/s:
				this.physics.moveToObject(this.player, this.target, 400);

				emit_move_avatar(this.target.x, this.target.y);
			}

		}, this);

		// // --- What happens when the player click the dude ----
		// this.player.on('pointerover', function (pointer) {
		// 	this.player.setTint(0x4c4c4c); //B8860B ff0000
		// }, this);
		// this.player.on('pointerout', function (pointer) {
		// 	this.player.clearTint();
		// }, this);
		// this.player.on('pointerdown', function (pointer) {
		// 	if(!isChoiceMade) {
		// 		isChoiceMade = true;
		// 		play_arm(Math.ceil(this.player.x/cell_size_x), Math.ceil(this.player.y/cell_size_y), num_cell, optionOrder, this, currentTrial); // "this" allows function.js to know where the game exists
		// 	}
		// }, this);

		// --- Other players' avatar ---
		for (let i = 0; i < maxGroupSize; i++) {
			let x_raw = Phaser.Math.Between(0, fieldWidth);
            let y_raw = Phaser.Math.Between(0, fieldHeight);
            let x = Math.floor( x_raw / cell_size_x) * cell_size_x + cell_size_x / 2 + field_x_floor;
            let y = Math.floor( y_raw / cell_size_y) * cell_size_y + cell_size_y / 2 + field_y_floor;
			let other_player = this.physics.add.sprite(x, y, 'other_1');
			let others_target = new Phaser.Math.Vector2(); // the direction of the avatar's movement
			// this.others_target = others_target;
			// this.other_player = other_player;
			// this.other_player.play('hovering');
			other_player_visibility_array[i] = false;
			other_player_array[i] = other_player;
			others_target_array[i] = others_target;
			other_player_array[i].play('hovering');
			other_player_array[i].alpha = 0.5; // Make other player's icon transparent 
			other_player_array[i].setScale(0.6);
			other_player_array[i].visible = other_player_visibility_array[i]; // others are invisible before they make their 1st choice	
		}

		// --- Tracking the social frequency at the current state (real time update) ---
		let social_frequency = new Array(num_cell*num_cell).fill(1);
		this.social_frequency = social_frequency

	}

	update(){
		if (needATimer) {
			needATimer = false;
			countdownBarStarts(this, maxChoiceStageTime);
		}
		// --- The focal player's avatar ---
		let distance = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.target.x, this.target.y);

		// --- Score text
		// this.historyText.setText('Total score: ' + totalEarning );
		this.historyText.setText('Remaining clicks: ' + (horizon + 1 - currentTrial));

		if (this.player.body.speed > 0) {
			//  4 is our distance tolerance, i.e. how close the player can get to the target
			//  before it is considered as being there. The faster it moves, the more tolerance is required.
			if (distance < 4)
			{
				this.player.body.reset(this.target.x, this.target.y);
				let my_box_x = Math.ceil((this.player.x - field_x_floor)/cell_size_x)
				let my_box_y = Math.ceil((this.player.y - field_y_floor)/cell_size_y)
				let my_option = (my_box_x + num_cell * (my_box_y-1));
				if (condition != 'competitive' & !isChoiceMade) {
					play_arm(my_box_x
						, my_box_y
						, num_cell
						, optionOrder
						, this
						, currentTrial
						, condition
						, this.social_frequency[my_option - 1]
						, this.payoff_noise
					); // "this" allows function.js to know where the game exists
					isChoiceMade = true;
				} else {
					update_done_n(my_box_x, my_box_y, num_cell, optionOrder, this, currentTrial)
					isChoiceMade = true;
				}
			}
			// The dude should not be clickable when moving
			// this.player.disableInteractive();
		}

		// avoid the player from flying away 
		if (this.player.x < field_x_floor | this.player.x > field_x_floor + fieldWidth | this.player.y < field_y_floor | this.player.y > field_y_floor + fieldHeight) {
			this.player.body.reset(this.target.x, this.target.y);
			let my_box_x = Math.ceil((this.player.x - field_x_floor)/cell_size_x)
			let my_box_y = Math.ceil((this.player.y - field_y_floor)/cell_size_y)
			let my_option = (my_box_x + num_cell * (my_box_y-1));
			if (condition != 'competitive' & !isChoiceMade) {
				play_arm(my_box_x
					, my_box_y
					, num_cell
					, optionOrder
					, this
					, currentTrial
					, condition
					, this.social_frequency[my_option - 1]
					, this.payoff_noise
				); // "this" allows function.js to know where the game exists
				isChoiceMade = true;
			} else {
				update_done_n(my_box_x, my_box_y, num_cell, optionOrder, this, currentTrial)
				isChoiceMade = true;
			}
		}

		// --- The other players' avatar ---
		for (let i = 0; i < maxGroupSize; i++) {
			let distance_other = Phaser.Math.Distance.Between(other_player_array[i].x
				, other_player_array[i].y
				, others_target_array[i].x
				, others_target_array[i].y);
			if (other_player_array[i].body.speed > 0) {
				//  4 is our distance tolerance, i.e. how close the player can get to the target
				//  before it is considered as being there. The faster it moves, the more tolerance is required.
				if (distance_other < 8)
				{
					// let x_jitter = Phaser.Math.Between(-cell_size_x/3, cell_size_x/3);
					// let y_jitter = Phaser.Math.Between(-cell_size_x/3, cell_size_y/3);
					other_player_array[i].body.reset(others_target_array[i].x, others_target_array[i].y);
					if (i != subjectNumber - 1) {
						let box_x = Math.ceil((others_target_array[i].x - field_x_floor)/cell_size_x);
						let box_y = Math.ceil((others_target_array[i].y - field_y_floor)/cell_size_y);
						let option = (box_x + num_cell * (box_y-1));
						this.social_frequency[option - 1]++;
					}
					if (other_player_array[i].visible == false && subjectNumber != i + 1) {
						other_player_visibility_array[i] = true;
						if (this.isSceneDemoGroupActive == true) {
							other_player_array[i].visible = other_player_visibility_array[i];
						}
					}
				}
			}
		}

	}
};

export default SceneDemoGroup;