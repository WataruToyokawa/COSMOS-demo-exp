'use strict';

import {configWidth
	, configHeight
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
		// --- background colour ---
		this.cameras.main.setBackgroundColor(0xffffff); //#FFFFFF == 'white'

		this.resultText = this.add.text(configWidth/2, configHeight/2, 'Result 👇', { fontSize: '30px', fill: '#000'});

		console.log('myChoices = ' + myChoices)
		
	}

	update(){

	}
}

export default SceneResult;