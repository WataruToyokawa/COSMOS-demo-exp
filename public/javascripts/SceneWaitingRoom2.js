// SceneWaitingRoom2

import {rand
	, isNotNegative
	, BoxMuller
	, sum
	, waitingBarCompleted
	, debug_pointerdown
	, sending_core_is_ready
	, goToQuestionnaire
	, settingConfirmationID
	, testFunction
} from './functions.js';

class SceneWaitingRoom2 extends Phaser.Scene {

	constructor (){
	    super({ key: 'SceneWaitingRoom2', active: false });
	}

	preload(){
	}

	create(){
		// background colour
		this.cameras.main.setBackgroundColor('#FFFFFF'); //#FFFFFF == 'white'
		// text styles
		const textStyle = 
			{ fontSize: '24px', fill: nomalTextColor, wordWrap: { width: configWidth-80, useAdvancedWrap: true } };
		const noteStyle = 
			{ fontSize: '24px', fill: noteColor, wordWrap: { width: configWidth-80, useAdvancedWrap: true }, fontstyle: 'bold' };
		//  Texts
	    let title = this.add.text(configWidth/2, 18, waitingForOthers[0], { fontSize: '36px', fill: '#000', fontstyle: 'bold' });
	    let note1 = this.add.text(configWidth/2, 70, waitingForOthers[1], textStyle);
	    let note2 = this.add.text(configWidth/2, 70+30*2, waitingForOthers[2], textStyle);
	    let note3 = this.add.text(configWidth/2, 70+30*4, waitingForOthers[3], noteStyle);
	    title.setOrigin(0.5, 0.5);
	    note1.setOrigin(0.5, 0.5);
	    note2.setOrigin(0.5, 0.5);
	    note3.setOrigin(0.5, 0.5);
		
        // waitingBonusBar
        //restTime = 10;
        waitingCountdown = this.time.delayedCall(restTime, waitingBarCompleted, [], this);
		//waitingBox = this.add.graphics();
		//waitingBar = this.add.graphics();
		//waitingBox.fillStyle(0x000000, 0.7); // color, alpha
		//waitingBox.fillRect(240, 270, 320, 50);
		bonusBox = this.add.graphics();
		bonusBar = this.add.graphics();
		bonusBox.fillStyle(0x000000, 0.7); // color, alpha
		bonusBox.fillRect(240, 380, 320, 50);
		// countdown texts
		//countdownText = this.add.text(configWidth/2, 340, 'The study starts in ?? sec.' , textStyle);
		//countdownText.setOrigin(0.5, 0.5);
		bonusText = this.add.text(configWidth/2, 450, 'Your waiting bonus: '+waitingBonus.toString().substr(0, 2)+' pence.' , textStyle);
		bonusText.setOrigin(0.5, 0.5);
	}

	update(){
		waitingBonus += 1.0/(6*this.game.loop.actualFps)
		bonusBar.clear();
		bonusBar.fillStyle(0xff5a00, 1);
		if(waitingBonus*2<300) {
	    	bonusBar.fillRect(250, 390, waitingBonus*2, 30); //1 pence per 6 seconds = 6 pounds per hour
		}else{
			bonusBar.fillRect(250, 390, 300, 30);
		}
		bonusText.setText('Your waiting bonus: '+waitingBonus.toString().substr(0, 2)+' pence.');
	}
};

export default SceneWaitingRoom2;
