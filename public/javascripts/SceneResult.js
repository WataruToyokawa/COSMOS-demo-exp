'use strict';

import {configWidth
	, configHeight
	, field_x_floor
} from './global_const_values.js';

// import {wake_main_stage_up
// 	, go_to_summary_page
// } from './functions.js';

// import { Chart, registerables } from '../../node_modules/chart.js'
// const Chart = require('../../node_modules/chart.js');

class SceneResult extends Phaser.Scene {

	constructor (){
	    super({ key: 'SceneResult', active: false });
	}

	preload(){
	}

	init (data) {
		// this.myChoices = data.myChoices;
		// this.myEarnings = data.myEarnings;
	}

	create(){
		// --- resize the canvas element ---
		// this.game.scale.scaleMode = Phaser.Scale.NONE;
		// this.game.scale.refresh();
		// this.game.scale.resize(configWidth, configHeight/6);
		this.scale.setGameSize(configWidth, configHeight/6);
		// --- background colour ---
		this.cameras.main.setBackgroundColor(0x87CEEB); //(0xffffff); //#FFFFFF == 'white'

		this.resultText = this.add.text(field_x_floor, configHeight/2/6, 'Well done! \nScroll down \nto see the result below 👇', { fontSize: '20px', fill: '#000'});

		// console.log('myChoices = ' + myChoices)
		
	}

	update(){

	}
}

export default SceneResult;