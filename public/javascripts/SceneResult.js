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
		this.scale.resize(configWidth, configHeight/6);
		// --- background colour ---
		this.cameras.main.setBackgroundColor(0xffffff); //#FFFFFF == 'white'

		this.resultText = this.add.text(field_x_floor, configHeight/2/6, 'Well done! Look at the result 👇', { fontSize: '30px', fill: '#000'});

		// console.log('myChoices = ' + myChoices)
		
	}

	update(){

	}
}

export default SceneResult;