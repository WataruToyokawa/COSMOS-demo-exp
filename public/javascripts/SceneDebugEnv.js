'use strict';

import {configWidth
	, fieldHeight
	, fieldWidth
	, cell_size_x
	, cell_size_y
	, nomalTextColor
	, num_cell
} from './global_const_values.js';

// import {testFunction
// } from './functions.js';

// debug test environment
class SceneDebugEnv extends Phaser.Scene {

	constructor (){
	    super({ key: 'SceneDebugEnv', active: false });
	}

	preload(){
	}

	create(){
		// --- background colour ---
		this.cameras.main.setBackgroundColor('#99ccff'); //#FFFFFF == 'white'
		this.add.image(0, 0, 'fishhook_background').setOrigin(0, 0).setScale(0.75); // .setOrigin(1, 1) if u want rigt-btm

		// --- history window ---
		let historyText = this.add.text(16, fieldHeight + 16, 'Past yield: ???', { fontSize: '25px', fill: '#000' });
		this.historyText = historyText;

		// --- social information window (including my payoff from the preceding trial) ---
		this.scene.launch('SceneSocialWindow', {previous_payoffs: [100,200,300,400]});

		// --- Creating options ---
		let options = {}
		for (let i = 1; i < num_cell+1; i++) {
			for (let j = 1; j < num_cell+1; j++) {
				options['box'+i+j] = this.add.rectangle((i-1/2)*cell_size_x, (j-1/2)*cell_size_y, cell_size_x, cell_size_y);
				options['box'+i+j].setStrokeStyle(2, 0x1a65ac).setInteractive();
				// function
				options['box'+i+j].on('pointerover', function (pointer) {
					/* ====================================================================
						NOTE:
						Past rewards should be stored as a list
						Once such a list is ready, I should rewrite the following i and j
					=======================================================================*/
					this.historyText.setText('Past yield: box' + i + j);
					this.scene.launch('SceneDebugPopup', {x: pointer.x, y:pointer.y});
				}, this);
			}
		}

		// --- game objects ---
		let player = this.physics.add.sprite(cell_size_x * 3/2, 4 * cell_size_x + cell_size_x/2, 'player_23');
		let target = new Phaser.Math.Vector2();
		this.target = target;
		this.player = player;
		this.player.play('down-walk').setInteractive({ cursor: 'pointer' });
		// this.debug = this.add.graphics();

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

			// this.debug.clear().lineStyle(1, 0x00ff00);
			// this.debug.lineBetween(0, this.target.y, configHeight, this.target.y);
			// this.debug.lineBetween(this.target.x, 0, this.target.x, configWidth);

			debug_pointerdown(this.target.x, this.target.y);

		}, this);

		// --- What happens when the player click the dude ----
		this.player.on('pointerover', function (pointer) {
			this.player.setTint(0x4c4c4c); //B8860B ff0000
		}, this);
		this.player.on('pointerout', function (pointer) {
			this.player.clearTint();
		}, this);
		this.player.on('pointerdown', function (pointer) {
			testFunction(Math.ceil(this.player.x/cell_size_x), Math.ceil(this.player.y/cell_size_y), this); // "this" allows function.js to know where the game exists
		}, this);
	}

	update(){
		var distance = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.target.x, this.target.y);

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

export default SceneDebugEnv;
