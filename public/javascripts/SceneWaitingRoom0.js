// SceneWaitingRoom0

import {configWidth
	, nomalTextColor
	, noteColor
} from './global_const_values.js';

import {rand
	, isNotNegative
	, BoxMuller
	, sum
	, waitingBarCompleted
	, sending_core_is_ready
	, goToQuestionnaire
	, settingConfirmationID
	// , testFunction
} from './functions.js';


class SceneWaitingRoom0 extends Phaser.Scene {

	// make it public so that other scene can access to it (?)
	//public sprite: Phaser.GameObjects.Sprite;

	constructor (){
	    super({ key: 'SceneWaitingRoom0', active: true });
	}

	preload(){
		// progress bar
		let progressBox = this.add.graphics();
		let progressBar = this.add.graphics();
		progressBox.fillStyle(0x222222, 0.8);
		progressBox.fillRect(240, 270, 320, 50);
		// loading text
		let width = this.cameras.main.width;
		let height = this.cameras.main.height;
		let loadingText = this.make.text({
		    x: width / 2,
		    y: height / 2 - 50,
		    text: 'Loading...',
		    style: {
		        font: '20px',
		        fill: nomalTextColor
		    }
		});
		loadingText.setOrigin(0.5, 0.5);
		// percent text
		let percentText = this.make.text({
		    x: width / 2,
		    y: height / 2 - 5,
		    text: '0%',
		    style: {
		        font: '18px monospace',
		        fill: '#ffffff'
		    }
		});
		percentText.setOrigin(0.5, 0.5);
		// ---- loading stuff -----
	    this.load.image('button', 'assets/button.001.png');
	    this.load.image('button_active', 'assets/button.active.png');
		this.load.image('bonusBarFrame', 'assets/bar.png');
		this.load.image('bonusBar', 'assets/scaleOrange.png');
		this.load.image('perfectImg', 'assets/PERFECT.png');
		this.load.image('startImg', 'assets/start.png');
		this.load.image('energycontainer', 'assets/energycontainer.png');
		this.load.image('energybar', 'assets/energybar.png');

		// ---- Loading the players' avatar ----
		this.load.pack("pack", "assets/preload-asset-pack.json");
		

		this.load.image('blackbox', 'assets/blackbox.png');
		// progress bar functions
		this.load.on('progress', function (value) {
		    ////console.log(value);
		    progressBar.clear();
		    progressBar.fillStyle(0xffffff, 1);
		    progressBar.fillRect(250, 280, 300 * value, 30);
		    percentText.setText(parseInt(value * 100) + '%');
		});
		this.load.on('fileprogress', function (file) {
		    //console.log(file.src);
		});
		this.load.on('complete', function () {
		    // console.log('preloading is completed!: core is ready');
		    isPreloadDone = true;
		    progressBar.destroy();
			progressBox.destroy();
			loadingText.destroy();
			percentText.destroy();
			sending_core_is_ready(isPreloadDone)
			// if(!isWaitingRoomStarted) {
			// 	socket.emit('loading completed');
			// }
			// execute if preload completed later than on.connection('this is your parameter')
			//if(isEnvironmentReady) this.game.scene.start('SceneWaitingRoom');
			//======== letting the server know latency with this client ==========
		    // after calculating the first average latency
		    // the client should be put into the individual condition
		    // sending_core_is_ready(isPreloadDone);
		    //socket.emit('core is ready', {latency: 0, maxLatencyForGroupCondition: maxLatencyForGroupCondition});

		    // setTimeout(function(){
		    //     submittedLatency = sum(averageLatency)/averageLatency.length;
		    //     socket.emit('core is ready', {latency: submittedLatency, maxLatencyForGroupCondition: maxLatencyForGroupCondition});
		    //     $("#latency").val(submittedLatency);
		    // }, averageLatency.length*1000+500);

		    //======== end: letting the server know latency with this client ==========
		});
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
	    let title = this.add.text(configWidth/2, 18, waitingRoomText0[0], { fontSize: '36px', fill: '#000', fontstyle: 'bold' });
	    let note1 = this.add.text(configWidth/2, 70, waitingRoomText0[1], textStyle);
	    let note2 = this.add.text(configWidth/2, 70+30*2, waitingRoomText0[2], textStyle);
	    let note3 = this.add.text(configWidth/2, 70+30*4, waitingRoomText0[3], noteStyle);
	    title.setOrigin(0.5, 0.5);
	    note1.setOrigin(0.5, 0.5);
	    note2.setOrigin(0.5, 0.5);
	    note3.setOrigin(0.5, 0.5);
	}

	update(){
		emitting_time += 1/(3*this.game.loop.actualFps) // incrementing every 3 seconds
		if (!isWaitingRoomStarted & emitting_time % 3 == 0) {
			sending_core_is_ready(isPreloadDone)
		}
	}
};

export default SceneWaitingRoom0;