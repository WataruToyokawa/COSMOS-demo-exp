'use strict';

import {fieldHeight
	, fieldWidth
	, cell_size_x
	, cell_size_y
	, num_cell
} from './global_const_values.js';

import {play_arm
	, countdownBarStarts
	, getRandomIntInclusive
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
		let historyText = this.add.text(16, fieldHeight + 16, 'You are in zone __', { fontSize: '25px', fill: '#000' });
		this.historyText = historyText;

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
					this.historyText.setText( 'You are in zone ' + (i + num_cell * (j-1)) );
					this.scene.launch('SceneDebugPopup', {x: pointer.x, y:pointer.y});
				}, this);
			}
		}

		// --- game objects ---
		let total_num_cell = num_cell * num_cell
		,	player_initial_potition = getRandomIntInclusive(total_num_cell - 1, 1)
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
		this.energyBar = this.add.sprite(energyContainer.x + 46, energyContainer.y, 'energybar'); // the energy bar. 
		// a copy of the energy bar to be used as a mask. Another simple sprite but...
		this.energyMask = this.add.sprite(this.energyBar.x, this.energyBar.y, 'energybar');
		// ...it's not visible...
		this.energyMask.visible = false;
		// resize them
		let energyContainer_originalWidth = energyContainer.displayWidth
		,	energyContainer_newWidth = 200
		,	container_bar_ratio = this.energyBar.displayWidth / energyContainer.displayWidth
		;
		energyContainer.displayWidth = energyContainer_newWidth;
		energyContainer.scaleY = energyContainer.scaleX;
		this.energyBar.displayWidth = energyContainer_newWidth * container_bar_ratio;
		this.energyBar.scaleY = this.energyBar.scaleX;
		this.energyBar.x = energyContainer.x + (46 * energyContainer_newWidth/energyContainer_originalWidth);
		this.energyMask.displayWidth = this.energyBar.displayWidth;
		this.energyMask.scaleY = this.energyMask.scaleX;
		this.energyMask.x = this.energyBar.x;
		// and we assign it as this.energyBar's mask.
		this.energyBar.mask = new Phaser.Display.Masks.BitmapMask(this, this.energyMask);
		needATimer = true;
		// =============== A looking-good timer =================================

		// --- What happens when click events fire ------
		this.input.on('pointerdown', function (pointer) {

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

			// move_avatar(this.target.x, this.target.y); // Indiv condition doesn't have to share it with server

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
	}

	update(){
		if (needATimer) {
			needATimer = false;
			countdownBarStarts(this, maxChoiceStageTime);
		}
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
	}
};

export default SceneDemoIndiv;