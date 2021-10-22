/*

A multi-player 2D continuous bandit task
Author: Wataru Toyokawa (wataru.toyokawa@uni-konstanz.de)
05 October 2021

1. The task is basically the same as Wu et al. 2018 Nat. Hum. Behav.
2. However, it is a multi-player game (that proceeds trial-by-trial bases)
3. The connection is Server-Client (not the P2P connection) and synchronized by the server

*/

'use strict';

import my_name from './test_module.js';

console.log('My name is ' + my_name);

const myData = [];


/**===============================================
	Phaser Game Script
==================================================*/

window.onload = function() {
	// basic experimental values goes to POST values (in game.ejs)
	$("#amazonID").val(amazonID); // amazonID is defined in the game.ejs
	$("#completed").val(completed); // let values
	$("#currentTrial").val(currentTrial); // let values


    //======== monitoring reload activity ==========
    if (window.performance & amazonID != 'INHOUSETEST') {
        if (performance.navigation.type === 1) {
            // Redirecting to the questionnaire
            socket.io.opts.query = 'sessionName=already_finished';
            socket.disconnect();
            window.location.href = htmlServer + portnumQuestionnaire +'/questionnaireForDisconnectedSubjects?amazonID='+amazonID+'&bonus_for_waiting='+waitingBonus+'&totalEarningInCent='+Math.round((totalEarning*cent_per_point))+'&confirmationID='+confirmationID+'&exp_condition='+exp_condition+'&indivOrGroup='+indivOrGroup+'&completed='+0+'&latency='+submittedLatency;
        }
    }
    //======== end: monitoring reload activity =====

    //======== monitoring Tab activity ==========
    let hiddenTimer
    ,   hidden_elapsedTime = 0
    ;
        // Judging the window state at the moment of this window read
    if(window.document.visibilityState == 'hidden'){
        hiddenTimer = setInterval(function(){
            hidden_elapsedTime += 500;
            if (hidden_elapsedTime > browserHiddenPermittedTime) {
                socket.io.opts.query = 'sessionName=already_finished';
                socket.disconnect();
            }
        }, 500);
    }
        // When visibility status is changed, judge the status again
    window.document.addEventListener("visibilitychange", function(e){
        ////console.log('this window got invisible.');
        if (window.document.visibilityState == 'hidden') {
            hidden_elapsedTime += 1;
            hiddenTimer = setInterval(function(){
                hidden_elapsedTime += 500;
                if (hidden_elapsedTime > browserHiddenPermittedTime & amazonID != 'INHOUSETEST') {
                    socket.io.opts.query = 'sessionName=already_finished';
                    socket.disconnect();
                }
            }, 500);
        } else {
            clearTimeout(hiddenTimer);
            if (hidden_elapsedTime > browserHiddenPermittedTime & amazonID != 'INHOUSETEST') {
                setTimeout(function(){
                    // Force client to move to the questionnaire
                    socket.io.opts.query = 'sessionName=already_finished';
                    socket.disconnect();
                    completed = 'browserHidden';
                    window.location.href = htmlServer + portnumQuestionnaire +'/questionnaireForDisconnectedSubjects?amazonID='+amazonID+'&bonus_for_waiting='+waitingBonus+'&totalEarningInCent='+Math.round((totalEarning*cent_per_point))+'&confirmationID='+confirmationID+'&exp_condition='+exp_condition+'&indivOrGroup='+indivOrGroup+'&completed='+completed+'&latency='+submittedLatency;
                }, 200); // wait until waitingBonus is fully calculated
            }
            hidden_elapsedTime = 0;
        }
    });
    //======== end: monitoring tab activity =====

	// SceneWaitingRoom0
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
			// loading stuff
		    this.load.image('button', 'assets/button.001.png');
		    this.load.image('button_active', 'assets/button.active.png');
			this.load.image('bonusBarFrame', 'assets/bar.png');
			this.load.image('bonusBar', 'assets/scaleOrange.png');
			this.load.image('perfectImg', 'assets/PERFECT.png');
			this.load.image('startImg', 'assets/start.png');
			this.load.image('energycontainer', 'assets/energycontainer.png');
			this.load.image('energybar', 'assets/energybar.png');

			// dude
			// for (let i=1; i<25; i++) {
			// 	if (i < 10) {
			// 		this.load.image('player_0'+i, 'assets/Player/player_0'+i+'.png');
			// 	} else {
			// 		this.load.image('player_'+i, 'assets/Player/player_'+i+'.png');
			// 	}
			// }
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
				//if(isEnvironmentReady) game.scene.start('SceneWaitingRoom');
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
			emitting_time += 1/(3*game.loop.actualFps) // incrementing every 3 seconds
			if (!isWaitingRoomStarted & emitting_time % 3 == 0) {
				sending_core_is_ready(isPreloadDone)
			}
		}
	};



	// SceneWaitingRoom
	class SceneWaitingRoom extends Phaser.Scene {

		constructor (){
		    super({ key: 'SceneWaitingRoom', active: false });
		}

		preload(){
		}

		create(){
			isWaitingRoomStarted = true;
			// background colour
			this.cameras.main.setBackgroundColor('#FFFFFF'); //#FFFFFF == 'white'
			// text styles
			const textStyle = 
				{ fontSize: '24px', fill: nomalTextColor, wordWrap: { width: configWidth-80, useAdvancedWrap: true } };
			const noteStyle = 
				{ fontSize: '24px', fill: noteColor, wordWrap: { width: configWidth-80, useAdvancedWrap: true }, fontstyle: 'bold' };
			//  Texts
		    let title = this.add.text(configWidth/2, 18, waitingRoomText[0], { fontSize: '36px', fill: '#000', fontstyle: 'bold' });
		    let note1 = this.add.text(configWidth/2, 70, waitingRoomText[1], textStyle);
		    let note2 = this.add.text(configWidth/2, 70+30*2, waitingRoomText[2], textStyle);
		    let note3 = this.add.text(configWidth/2, 70+30*4, waitingRoomText[3], noteStyle);
		    title.setOrigin(0.5, 0.5);
		    note1.setOrigin(0.5, 0.5);
		    note2.setOrigin(0.5, 0.5);
		    note3.setOrigin(0.5, 0.5);
			
            // waitingBonusBar
            this.restTime = restTime;
            waitingCountdown = this.time.delayedCall(restTime, waitingBarCompleted, [], this);
			waitingBox = this.add.graphics();
			waitingBar = this.add.graphics();
			waitingBox.fillStyle(0x000000, 0.7); // color, alpha
			waitingBox.fillRect(240, 270, 320, 50);
			bonusBox = this.add.graphics();
			bonusBar = this.add.graphics();
			bonusBox.fillStyle(0x000000, 0.7); // color, alpha
			bonusBox.fillRect(240, 380, 320, 50);
			// countdown texts
			countdownText = this.add.text(configWidth/2, 340, 'The study starts in ?? sec.' , textStyle);
			countdownText.setOrigin(0.5, 0.5);
			bonusText = this.add.text(configWidth/2, 450, 'Your waiting bonus: '+waitingBonus.toString().substr(0, 2)+' pence.' , textStyle);
			bonusText.setOrigin(0.5, 0.5);

		}

		update(){
			waitingBar.clear();
			waitingBar.fillStyle(0x00a5ff, 1);
		    waitingBar.fillRect(250, 280, 300 * waitingCountdown.getProgress(), 30);
			countdownText.setText('The study starts in ' + ( Math.floor(0.9+(this.restTime/1000)*(1-waitingCountdown.getProgress())) ).toString().substr(0, 3) + ' sec.');
			////console.log( 0.9+(restTime/1000)*(1-waitingCountdown.getProgress()) );
			////console.log(waitingCountdown.getProgress());
			waitingBonus += 1.0/(6*game.loop.actualFps) //1 pence per 6 seconds = 6 pounds per hour
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

	// SceneWaitingRoom2
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
			waitingBonus += 1.0/(6*game.loop.actualFps)
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



	// SceneMain -- main scene; experimental task
	class SceneMain extends Phaser.Scene {

		constructor (){
		    super({ key: 'SceneMain', active: false });
		}

		preload(){
			}

		create(){


		}
		update(){

		}
	};


	let config = {
	    type: Phaser.AUTO, // Phaser.CANVAS, Phaser.WEBGL, or Phaser.AUTO
	    width: configWidth,
	    height: configHeight,
	    physics: {
	        default: 'arcade',
	        arcade: {
	            gravity: { y: 0 },
	            debug: false
	        }
	    },
	    parent: 'phaser-game-main',
	    scale: {
	        _mode: Phaser.Scale.FIT,
	        parent: 'phaser-game-main',
	        autoCenter: Phaser.Scale.CENTER_BOTH,
	        width: configWidth,
	        height: configHeight
	    },
	    dom: {
        	createContainer: true
    	},
	    scene:
	    [ SceneWaitingRoom0
	    , SceneWaitingRoom
	    , SceneWaitingRoom2
	    , SceneDebugEnv
	    , SceneDebugPopup
    	, ScenePerfect
    	, SceneStartCountdown
    	, SceneMain
    	]
	};

	let game = new Phaser.Game(config);
	game.scene.add('SceneWaitingRoom0');
	game.scene.add('SceneWaitingRoom');
	game.scene.add('SceneWaitingRoom2');
	game.scene.add('SceneDebugEnv');
	game.scene.add('SceneDebugPopup')
	game.scene.add('ScenePerfect');
	game.scene.add('SceneStartCountdown');
	game.scene.add('SceneMain');


	// I think this ping-pong monitoring is out-of-date; review needed. Discarded in the future
	socket.on('pong', function (ms) {
		////console.log(`socket :: averageLatency :: ${averageLatency} ms`);
		averageLatency.push(ms);
		averageLatency.splice(0,1);
	});

    socket.on('this_is_your_parameters', function (data) {
    	//console.log('received "this_is_your_parameters" from the server');
        confirmationID = data.id;
        myRoom = data.room;
        maxChoiceStageTime = data.maxChoiceStageTime;
        indivOrGroup = data.indivOrGroup;
        exp_condition = data.exp_condition; //binary_4ab
        riskDistributionId = data.riskDistributionId;
        subjectNumber = data.subjectNumber;
        // isLeftRisky = data.isLeftRisky;
        // numOptions = data.numOptions;
        optionOrder = data.optionOrder;
        // console.log('this is your optionOrder: ' + optionOrder);
        //setSlotPosition(data.isLeftRisky);
        // if (numOptions == 2) {
        // 	settingRiskDistribution(data.riskDistributionId);
        // } else {
        // 	settingRiskDistribution_4ab(data.riskDistributionId);
        // }

        // avoiding safari's reload function
        if(!window.sessionStorage.getItem('uniqueConfirmationID')) {
            window.sessionStorage.setItem('uniqueConfirmationID', confirmationID);
        } else if (exceptions.indexOf(amazonID) == -1) {
            // there is already an unique confirmation id existing in the local storage
            socket.io.opts.query = 'sessionName=already_finished';
            socket.disconnect();
            window.location.href = htmlServer + portnumQuestionnaire + '/multipleAccess';
        }
        socket.io.opts.query = 'sessionName='+data.id+'&roomName='+data.room+'&amazonID='+amazonID+'&bonus_for_waiting='+waitingBonus+'&totalEarning='+totalEarning+'&confirmationID='+confirmationID+'&exp_condition='+exp_condition+'&indivOrGroup='+indivOrGroup+'&completed='+completed+'&latency='+submittedLatency;
        //console.log('client session name is ' + socket.io.opts.query);
        //console.log('and client subjectNumber is ' + subjectNumber);
        //console.log('and maxChoiceStageTime = ' + maxChoiceStageTime);
        //console.log('and confirmationID is = ' + confirmationID);
        $("#exp_condition").val(exp_condition);
        //$("#confirmationID").val(data.id);
        settingConfirmationID(confirmationID);
    });

    socket.on('this is the remaining waiting time', function(data){
        isEnvironmentReady = true;
        maxWaitingTime = data.max;
        maxGroupSize = data.maxGroupSize;
        horizon = data.horizon;
        restTime = data.restTime;
        // console.log('socket.on: "this is the remaining waiting time" : '+restTime+' msec.');
        if (isPreloadDone & !isWaitingRoomStarted) {
        	game.scene.start('SceneWaitingRoom');
        } else {
        	//socket.emit('not ready yet');
        }
        //SceneWaitingRoom
        //core.replaceScene(core.waitingRoomScene(data.restTime));
    });

    socket.on('wait for others finishing test', function () {
    	game.scene.sleep('SceneWaitingRoom');
    	game.scene.sleep('ScenePerfect');
        game.scene.start('SceneWaitingRoom2');
    });

    // The task starts
    socket.on('this room gets started', function(data) {
        //console.log('Group size reached ' + data.n + ' conditoin: ' + data.exp_condition + ' and indivOrGroup is ' + data.indivOrGroup);
        exp_condition = data.exp_condition;
        // isLeftRisky = data.isLeftRisky;
        indivOrGroup = data.indivOrGroup;
        maxChoiceStageTime = data.maxChoiceStageTime;
        $("#indivOrGroup").val(indivOrGroup);
        $("#bonus_for_waiting").val(Math.round(waitingBonus));
        ////console.log('your indivOrGroup is ' + $("#indivOrGroup").val());
        /*if(indivOrGroup == 0) {
            choiceOpportunities = 3; //3
        } else {
            choiceOpportunities = 1;
        }*/
        waitingRoomFinishedFlag = 1;
        game.scene.sleep('SceneWaitingRoom');

        // For the debug,
        game.scene.start('SceneDebugEnv');
        // For the experiment
        // game.scene.start('SceneInstruction', data);
        
    });

    socket.on('you guys are individual condition', function () {
    	//console.log('receive: "you guys are individual condition"');
        socket.emit('ok individual condition sounds good');
    });

    socket.on('all passed the test', function(data) {
        //console.log('testPassed reached ' + data.testPassed + ' conditoin: ' + data.exp_condition);
        game.scene.sleep('SceneWaitingRoom');
        game.scene.sleep('SceneWaitingRoom2');
        game.scene.start('SceneStartCountdown');
    });

    socket.on('client disconnected', function(data) {
        console.log('client disconnected ' + data.disconnectedClient + ' left the room');
    });

    socket.on('these are done subjects', function(data) {
        doneSubject = data.doneSubject;
        //console.log('doneSubject is ' + doneSubject);
    });

    socket.on('Proceed to next round', function(data) {

        currentTrial++;
        totalEarning += payoff;
        $("#totalEarningInCent").val(Math.round((totalEarning*cent_per_point)));
        $("#totalEarningInUSD").val(Math.round((totalEarning*cent_per_point))/100);
        $("#currentTrial").val(currentTrial);
        $("#exp_condition").val(exp_condition);
        //$("#confirmationID").val(confirmationID);
        $("#bonus_for_waiting").val(Math.round(waitingBonus));
        payoffText.destroy();
        waitOthersText.destroy();
        for (let i =1; i<numOptions+1; i++) {
        	objects_feedbackStage['box'+i].destroy();
        }
    	game.scene.sleep('ScenePayoffFeedback');
    	game.scene.start('SceneMain');
    	//console.log('restarting the main scene!: mySocialInfo = '+data.socialFreq[data.round-1]);
    });

    socket.on('End this session', function(data) {
        currentTrial++;
        totalEarning += payoff;
        $("#totalEarningInCent").val(Math.round((totalEarning*cent_per_point)));
        $("#totalEarningInUSD").val(Math.round((totalEarning*cent_per_point))/100);
        $("#currentTrial").val(currentTrial);
        $("#completed").val(1);
        $("#exp_condition").val(exp_condition);
        //$("#confirmationID").val(confirmationID);
        payoffText.destroy();
        waitOthersText.destroy();
        for (let i =1; i<numOptions+1; i++) {
        	objects_feedbackStage['box'+i].destroy();
        }
    	game.scene.sleep('ScenePayoffFeedback');
    	game.scene.start('SceneGoToQuestionnaire');
    });

    socket.on('S_to_C_welcomeback', function(data) {
    	// if (waitingRoomFinishedFlag == 1) {
    	if (understandingCheckStarted == 1) {
	    	// You could give a change to the shortly disconnected client to go back to the session 
	    	// However, for now I just redirect them to the questionnaire
	        socket.io.opts.query = 'sessionName=already_finished';
	        socket.disconnect();
	        window.location.href = htmlServer + portnumQuestionnaire +'/questionnaireForDisconnectedSubjects?amazonID='+amazonID+'&bonus_for_waiting='+waitingBonus+'&totalEarningInCent='+Math.round((totalEarning*cent_per_point))+'&confirmationID='+confirmationID+'&exp_condition='+exp_condition+'&indivOrGroup='+indivOrGroup+'&completed='+0+'&latency='+submittedLatency;
	        console.log('Received: "S_to_C_welcomeback": client = '+data.sessionName +'; room = '+data.roomName);
	    } else if (waitingRoomFinishedFlag != 1) {
	    	console.log('Received: "S_to_C_welcomeback" but the waiting room is not finished yet: client = '+data.sessionName +'; room = '+data.roomName);
	    	if (typeof restTime != 'undefined') {
	    		socket.emit('this is the previous restTime', {restTime: restTime});
	    	}
	    } else {
	    	console.log('Received: "S_to_C_welcomeback" but the understanding test is not started yet: client = '+data.sessionName +'; room = '+data.roomName);
	    }
    });

} // window.onload -- end
