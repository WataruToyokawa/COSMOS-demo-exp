'use strict';

import {fieldHeight
	, fieldWidth
	, cell_size_x
	, cell_size_y
	, num_cell
	, field_x_floor
	, field_y_floor
} from './global_const_values.js';

import {play_arm
	, countdownBarStarts
	, getRandomIntInclusive
	, sum
} from './functions.js';

// debug test environment
class SceneDemoIndiv extends Phaser.Scene {

	constructor (){
	    super({ key: 'SceneDemoIndiv', active: false });
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
		// this.historyText.setText( 'You are in zone ' + (i + num_cell * (j-1)) );

		// --- Creating options ---
		let options = {}
		this.options = options
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

		// --- game objects ---
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

			if (!isChoiceMade) {

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
				// emit_move_avatar(this.target.x, this.target.y); // Indiv condition doesn't have to share it with server
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
	}

	update(){
		if (needATimer) {
			needATimer = false;
			countdownBarStarts(this, maxChoiceStageTime);
		}
		let distance = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.target.x, this.target.y);

		// --- Score text
		// this.historyText.setText('Total score: ' + totalEarning );
		this.historyText.setText('Remaining clicks: ' + (horizon + 1 - currentTrial));

		if (this.player.body.speed > 0) {
			//  4 is our distance tolerance, i.e. how close the player can get to the target
			//  before it is considered as being there. The faster it moves, the more tolerance is required.
			if (distance < 4)
			{
				isChoiceMade = true;
				this.player.body.reset(this.target.x, this.target.y);
				play_arm(Math.ceil((this.player.x - field_x_floor)/cell_size_x), Math.ceil((this.player.y - field_y_floor)/cell_size_y), num_cell, optionOrder, this, currentTrial); // "this" allows function.js to know where the game exists
			}

		}
		
		// avoid the player from flying away 
		if (this.player.x < field_x_floor | this.player.x > field_x_floor + fieldWidth | this.player.y < field_y_floor | this.player.y > field_y_floor + fieldHeight) {
			isChoiceMade = true;
			this.player.body.reset(this.target.x, this.target.y);
			play_arm(Math.ceil((this.player.x - field_x_floor)/cell_size_x), Math.ceil((this.player.y - field_y_floor)/cell_size_y), num_cell, optionOrder, this, currentTrial); // "this" allows function.js to know where the game exists
		}
	}
};

export default SceneDemoIndiv;