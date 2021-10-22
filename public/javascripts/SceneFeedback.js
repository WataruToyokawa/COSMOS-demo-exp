'use strict';

import {debug_pointerdown
	, debug_pointerdown_feedback
} from './functions.js';

class SceneFeedback extends Phaser.Scene {

	constructor (){
	    super({ key: 'SceneFeedback', active: false });
	}

	preload(){
	}

	init (data) {

	}

	create(){
		// --- background colour ---
		this.cameras.main.setBackgroundColor(0xffffff); //#FFFFFF == 'white'

		// ========= DEBUG ======================================

		// --- What happens when click events fire ------
		this.input.on('pointerdown', function (pointer) {

			debug_pointerdown_feedback(this);

		}, this);

		this.add.text(fieldWidth/2, fieldHeight/2, 'You got ???? fish', { fontSize: '50px', fill: '#000' }).setOrigin(0.5, 0.5);
		// ========= DEBUG ======================================

	}

	update(){

	}
}

export default SceneFeedback;