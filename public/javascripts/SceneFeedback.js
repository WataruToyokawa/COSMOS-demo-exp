'use strict';

import {cell_size_x
    , cell_size_y
	, Rainbow
	, Secondary
	, fieldHeight
	, field_x_floor
	, field_y_floor
} from './global_const_values.js';

import {emit_this_trial_is_done
	, createTextBox
} from './functions.js';



// ==== Other classes ====================================
// import DotsEater from './DotsEater.js';
// import Ellipsis from './Ellipsis.js';

class SceneFeedback extends Phaser.Scene {

	constructor (){
	    super({ key: 'SceneFeedback', active: false });
	}

	preload(){
		this.load.scenePlugin({
            key: 'rexuiplugin',
            // url: 'https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexuiplugin.min.js',
			url: 'javascripts/rexuiplugin.min.js',
            sceneKey: 'rexUI'
        });
	}

	init (data) {
		this.payoff = data.payoff;
		this.clicked_box_position = data.clicked_box_position;
		this.box_quality = data.box_quality;
		this.x_pos = data.x * cell_size_x - cell_size_x/2 + field_x_floor;
		this.y_pos = data.y * cell_size_y - cell_size_y/2 + field_y_floor;
		this.isTimeout = data.isTimeout;
	}

	create(){
		//  --- DotEater animation ---- (see phaser3-loading-animations-premium)
		const loadingObj = this.add.container()
		this.loadingObj = loadingObj
		// DotsEater.create(this, this.x_pos, this.y_pos+20) //fieldWidth/2, fieldHeight/2 + 100
		// 				.useEaterColor(Secondary)
		// 				.useDotColor(...Rainbow)
		// 				.addToContainer(this.loadingObj)
		// 				.play()
		// Ellipsis.create(this, this.x_pos, this.y_pos+20).play()

		// --- background colour ---
		// this.cameras.main.setBackgroundColor(0xffffff); //#FFFFFF == 'white'

		// --- Announcement Text ----
		if (indivOrGroup == 1 & currentGroupSize > 1) {
			let waitOthersText = this.add.text(100, fieldHeight + field_y_floor + 60, 'Please wait for others...', { fontSize: '30px', fill: '#000'});
		}

		// --- make the timer object invisible 
		if (indivOrGroup == 0) {
			this.game.scene.keys.SceneDemoIndiv.energyContainer.visible = false;
			this.game.scene.keys.SceneDemoIndiv.energyBar.visible = false;
		} else {
			this.game.scene.keys.SceneDemoGroup.energyContainer.visible = false;
			this.game.scene.keys.SceneDemoGroup.energyBar.visible = false;
		}

		// this.add.text(this.x_pos, this.y_pos + 40, ''+this.payoff+' points!', { fontSize: '25px', fill: '#000' }).setOrigin(0.5, 0.5);
		if(this.payoff > 0) {
			createTextBox(this, this.x_pos - 45, this.y_pos - 60, {
				wrapWidth: 450,
			}).start(''+this.payoff+'kg fish!', 50); // points!

			// Updating the choice history data
			myChoices.push(this.box_quality);
			myEarnings.push(this.payoff);
			totalEarning += this.payoff;
		} else {
			this.textWindow = createTextBox(this, this.x_pos - 45, this.y_pos - 60, {
				wrapWidth: 450,
			}).start('Wait others!', 50);
		}
	}

	update(){
		if (needAFeedback && exp_condition != 'competitive') {
			needAFeedback = false;
			emit_this_trial_is_done(this, indivOrGroup, currentTrial, horizon, myChoices, myEarnings, exp_condition);
		} 
		// else if (this.isTimeout & condition == 'competitive') {
		// 	update_done_n(this, indivOrGroup, currentTrial, horizon, myChoices, myEarnings, condition);
		// }
	}
}

export default SceneFeedback;
