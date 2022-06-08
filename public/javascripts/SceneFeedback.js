'use strict';

import {configWidth
	, configHeight
	, fieldHeight
	, fieldWidth
	, Rainbow
	, Background
	, Primary
	, Secondary
	, PrimaryLight
} from './global_const_values.js';

import {wake_main_stage_up
	// , go_to_summary_page
	, emit_this_trial_is_done
} from './functions.js';

// ==== Other classes ====================================
import DotsEater from './DotsEater.js';

class SceneFeedback extends Phaser.Scene {

	constructor (){
	    super({ key: 'SceneFeedback', active: false });
	}

	preload(){
	}

	init (data) {
		this.payoff = data.payoff;
		this.clicked_box_position = data.clicked_box_position;
		this.box_quality = data.box_quality;
	}

	create(){
		//  --- DotEater animation ---- (see phaser3-loading-animations-premium)
		const loadingObj = this.add.container()
		this.loadingObj = loadingObj
		DotsEater.create(this, fieldWidth/2, fieldHeight/2 + 100)
						.useEaterColor(Secondary)
						.useDotColor(...Rainbow)
						.addToContainer(this.loadingObj)
						.play()

		// --- background colour ---
		this.cameras.main.setBackgroundColor(0xffffff); //#FFFFFF == 'white'

		// --- Announcement Text ----
		if (indivOrGroup == 1 & currentGroupSize > 1) {
			let waitOthersText = this.add.text(16, 60, 'Please wait for others...', { fontSize: '30px', fill: '#000'});
		} else {
			let waitOthersText = this.add.text(16, 60, '', { fontSize: '30px', fill: '#000'});
		}

		// --- OK! button ---
		// let okBtnContainer = this.add.container(configWidth/2, configHeight*2/3); // adding a container at the position
		// let okBtnImg = this.add.sprite(0, 0, 'button').setDisplaySize(300, 50).setInteractive({ cursor: 'pointer' });
		// let okBtnTxt = this.add.text(0, 0, 'Play Next!', { fontSize: '24px', fill: '#000' });
		// okBtnTxt.setOrigin(0.5, 0.5);
		// okBtnContainer.add(okBtnImg);
		// okBtnContainer.add(okBtnTxt);
		// okBtnContainer.visible = true;
		// // this.okBtnContainer = okBtnContainer;

		// okBtnImg.on('pointerover', function (pointer) {
	    // 	okBtnImg.setTint(0xa9a9a9);
	    // }, this);
	    // okBtnImg.on('pointerout', function (pointer) {
	    // 	okBtnImg.clearTint();
	    // }, this);
	    // okBtnImg.on('pointerdown', function (pointer) {

	    // 	if (currentTrial < horizon) {
		// 		isChoiceMade = false; // reset isChoiceMade counter 
		// 		if (indivOrGroup == 0) { // idividual condition can go straight to the next choice stage
		// 			wake_main_stage_up(this, indivOrGroup);
		// 		} else { // In group condition, however, people have to wait others 
		// 			emit_this_trial_is_done();
		// 		}
	    // 	} else {
	    // 		go_to_summary_page(this, myChoices, myEarnings);
	    // 	}

		// }, this);

		this.add.text(fieldWidth/2, fieldHeight/2, 'You got '+ this.payoff +' points!', { fontSize: '50px', fill: '#000' }).setOrigin(0.5, 0.5);

		// Updating the choice history data
		myChoices.push(this.box_quality);
		myEarnings.push(this.payoff);
	}

	update(){
		if (needAFeedback) {
			needAFeedback = false;
			isChoiceMade = false; // reset isChoiceMade counter 
			emit_this_trial_is_done(this, indivOrGroup, currentTrial, horizon, myChoices, myEarnings);
		}
	}
}

export default SceneFeedback;