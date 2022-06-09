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
} from './global_const_values.js';

import {emit_move_avatar
	, play_arm
	, countdownBarStarts
	, getRandomIntInclusive
} from './functions.js';

// debug test environment
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
		let historyText = this.add.text(16, fieldHeight + 16, 'You are in zone ???', { fontSize: '25px', fill: '#000' });
		this.historyText = historyText;

		// --- monitoring the activity of this stage ---
		let isSceneDemoGroupActive
		this.isSceneDemoGroupActive = isSceneDemoGroupActive
		this.isSceneDemoGroupActive = true

		// --- Creating options ---
		let options = {}
		this.options = options
		for (let i = 1; i < num_cell+1; i++) {
			for (let j = 1; j < num_cell+1; j++) {
				// this.add.image(0, 0, 'Loewenbraeu_Logo.svg').setOrigin(0, 0).setScale(0.75);
				this.options['box'+i+j] = this.add.rectangle((i-1/2)*cell_size_x, (j-1/2)*cell_size_y, cell_size_x, cell_size_y);
				this.options['box'+i+j].setStrokeStyle(6, 0x1a65ac).setInteractive();
				// function
				this.options['box'+i+j].on('pointerover', function (pointer) {
					/* ====================================================================
						NOTE:
						Past rewards should be stored as a list
						Once such a list is ready, I should rewrite the following i and j
					=======================================================================*/
					// this.historyText.setText('You are in zone ' + i + j);
					this.historyText.setText( 'You are in zone ' + (i + num_cell * (j-1)) );
					this.scene.launch('SceneDebugPopup', {x: pointer.x, y:pointer.y});
				}, this);
			}
		}

		// --- Main player's objects ---
		let total_num_cell = num_cell * num_cell
		,	player_initial_potition = getRandomIntInclusive(total_num_cell, 1)
		,	player_initial_x = (player_initial_potition % num_cell) * cell_size_x + cell_size_x/2
		,	player_initial_y = Math.floor(player_initial_potition / num_cell) * cell_size_y + cell_size_y/2
		;
		let player = this.physics.add.sprite(player_initial_x, player_initial_y, 'self_1');
		let target = new Phaser.Math.Vector2();
		this.target = target;
		this.player = player;
		this.player.play('hovering-self').setInteractive({ cursor: 'pointer' });
		this.player.setScale(0.7);

		// --- Countdown timer ---
		// =============== A looking-good timer =================================
		let energyContainer = this.add.sprite(100, fieldHeight + 60, 'energycontainer'); // the energy container. 
		this.energyContainer = energyContainer
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

			if (this.isSceneDemoGroupActive) {

				if (pointer.x > 0 & pointer.x < fieldWidth) {
					this.target.x = Math.floor( pointer.x / cell_size_x) * cell_size_x + cell_size_x / 2
				} else if (pointer.x <= 0) {
					this.target.x = cell_size_x / 2
				} else {
					this.target.x = Math.floor( fieldWidth / cell_size_x) * cell_size_x - cell_size_x / 2
				}

				if (pointer.y > 0 & pointer.y < fieldHeight) {
					this.target.y = Math.floor( pointer.y / cell_size_y) * cell_size_y + cell_size_y / 2
				} else if (pointer.y <= 0) {
					this.target.y = cell_size_y / 2
				} else {
					this.target.y = Math.floor( fieldHeight / cell_size_y) * cell_size_y - cell_size_y / 2
				}

				// Move at 200 px/s:
				this.physics.moveToObject(this.player, this.target, 400);

				// this.debug.clear().lineStyle(1, 0x00ff00);
				// this.debug.lineBetween(0, this.target.y, configHeight, this.target.y);
				// this.debug.lineBetween(this.target.x, 0, this.target.x, configWidth);

				emit_move_avatar(this.target.x, this.target.y);
			}

		}, this);

		// --- What happens when the player click the dude ----
		this.player.on('pointerover', function (pointer) {
			this.player.setTint(0x4c4c4c); //B8860B ff0000
		}, this);
		this.player.on('pointerout', function (pointer) {
			this.player.clearTint();
		}, this);
		this.player.on('pointerdown', function (pointer) {
			if(!isChoiceMade) {
				isChoiceMade = true;
				play_arm(Math.ceil(this.player.x/cell_size_x), Math.ceil(this.player.y/cell_size_y), num_cell, optionOrder, this, currentTrial); // "this" allows function.js to know where the game exists
			}
		}, this);

		// --- Other players' avatar ---
		for (let i = 0; i < maxGroupSize; i++) {
			let x_raw = Phaser.Math.Between(0, fieldWidth);
            let y_raw = Phaser.Math.Between(0, fieldHeight);
            let x = Math.floor( x_raw / cell_size_x) * cell_size_x + cell_size_x / 2;
            let y = Math.floor( y_raw / cell_size_y) * cell_size_y + cell_size_y / 2;
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

	}

	update(){
		if (needATimer) {
			needATimer = false;
			countdownBarStarts(this, maxChoiceStageTime);
		}
		// --- The focal player's avatar ---
		let distance = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.target.x, this.target.y);

		if (this.player.body.speed > 0) {
			//  4 is our distance tolerance, i.e. how close the player can get to the target
			//  before it is considered as being there. The faster it moves, the more tolerance is required.
			if (distance < 4)
			{
				this.player.body.reset(this.target.x, this.target.y);
			}
			// The dude should not be clickable when moving
			this.player.disableInteractive();
		}
		else {
			// The dude becomes clickable again when stops
			this.player.setInteractive({ cursor: 'pointer' });
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