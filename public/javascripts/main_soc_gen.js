/*

COSMOS demo -- a multi-armed bandit problem 
Author: Wataru Toyokawa (wataru.toyokawa@uni-konstanz.de)
24 April 2022

This file is taking care of the following things:

1. Configuring the game = new Phaser.Game(config);
2. Listening socket.on('signal-from-server', function (data) { Do something with data you received });
3. The game is built upon the browser window, that is, everything is happening after "window.onload"
4. If you want to communicate with object defined in each scene, use "game.scene.keys.SCENE_NAME.OBJECT_NAME"

*/

'use strict';

// ==== Scenes ===========================================
import SceneWaitingRoom0 from './SceneWaitingRoom0.js';
import SceneWaitingRoom from './SceneWaitingRoom.js';
import SceneWaitingRoom2 from './SceneWaitingRoom2.js';
import SceneDebugEnv from './SceneDebugEnv.js';
import SceneDemoIndiv from './SceneDemoIndiv.js';
import SceneDemoGroup from './SceneDemoGroup.js';
import SceneDebugPopup from './SceneDebugPopup.js';
import SceneSocialWindow from './SceneSocialWindow.js';
import ScenePerfect from './ScenePerfect.js';
import SceneStartCountdown from './SceneStartCountdown.js';
import SceneFeedback from './SceneFeedback.js';
import SceneResult from './SceneResult.js';
// import UIPlugin from '../../node_modules/phaser3-rex-plugins/templates/ui/ui-plugin.js';

// ===== Functions and const values =============================
import {configWidth
    , cell_size_x
    , cell_size_y
    , field_x_floor
    , field_y_floor
    , num_cell
    , configHeight
    , portnumQuestionnaire
    , socket
    , htmlServer
    , exceptions
} from './global_const_values.js';

import {settingConfirmationID
    , wake_main_stage_up
    , shuffleArray
    , play_arm_competitive
    , csvDownload
} from './functions.js';

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
    if (window.performance & amazonID != 'INHOUSETEST3') {
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
                if (hidden_elapsedTime > browserHiddenPermittedTime & amazonID != 'INHOUSETEST3') {
                    socket.io.opts.query = 'sessionName=already_finished';
                    socket.disconnect();
                }
            }, 500);
        } else {
            clearTimeout(hiddenTimer);
            if (hidden_elapsedTime > browserHiddenPermittedTime & amazonID != 'INHOUSETEST3') {
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
	        mode: Phaser.Scale.FIT,
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
        , SceneDemoIndiv
        , SceneDemoGroup
	    , SceneDebugEnv
	    , SceneDebugPopup
    	, ScenePerfect
    	, SceneStartCountdown
    	, SceneSocialWindow
        , SceneFeedback
        , SceneResult
    	]
	};

	let game = new Phaser.Game(config);
	game.scene.add('SceneWaitingRoom0');
	game.scene.add('SceneWaitingRoom');
	game.scene.add('SceneWaitingRoom2');
    game.scene.add('SceneDemoIndiv');
    game.scene.add('SceneDemoGroup');
	game.scene.add('SceneDebugEnv');
	game.scene.add('SceneDebugPopup')
	game.scene.add('ScenePerfect');
	game.scene.add('SceneStartCountdown');
	game.scene.add('SceneSocialWindow');
    game.scene.add('SceneFeedback');
    game.scene.add('SceneResult');


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
        payoff_noise = data.payoff_noise;
        riskDistributionId = data.riskDistributionId;
        subjectNumber = data.subjectNumber;
        optionOrder = data.optionOrder;
        maxGroupSize = data.maxGroupSize;

        // console.log('option order is ' + optionOrder);

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
        // console.log('payoff_noise is ' + payoff_noise);
        // console.log('optionOrder is ' + optionOrder);
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
        currentGroupSize = data.n;
        $("#indivOrGroup").val(indivOrGroup);
        $("#bonus_for_waiting").val(Math.round(waitingBonus));
        $("#exp_condition").val(exp_condition);
        ////console.log('your indivOrGroup is ' + $("#indivOrGroup").val());
        /*if(indivOrGroup == 0) {
            choiceOpportunities = 3; //3
        } else {
            choiceOpportunities = 1;
        }*/
        waitingRoomFinishedFlag = 1;
        game.scene.sleep('SceneWaitingRoom');

        // Making a unique jitter position assigned to each subject
        let position_size = Math.ceil(Math.sqrt(currentGroupSize))
        let x_unit = (cell_size_x * 2/3) / (position_size + 2)
        let y_unit = (cell_size_y * 2/3) / (position_size + 2)
        for (let i = 0; i < position_size + 2; i++) {
            for (let j = 0; j < position_size + 2; j++) {
                if (!(i > position_size/2 - 2 & i < position_size/2 + 2 & j > position_size/2 - 2 & j < position_size/2 + 2)) {
                    jitter_position_array.push({x: i * x_unit, y: j * y_unit})
                }
                if (i == position_size + 1 & j == position_size + 1) {
                    shuffleArray(jitter_position_array)
                }
            }
        }
        // console.log(jitter_position_array.length + ' and group size = ' + currentGroupSize)
        // console.log(jitter_position_array)

        // For the debug,
        if (indivOrGroup == 0) {
            game.scene.start('SceneDemoIndiv');
        } else {
            game.scene.start('SceneDemoGroup');
        }
        // For the experiment
        // game.scene.start('SceneInstruction', data);
        
    });

    socket.on('you guys are individual condition', function () {
    	//console.log('receive: "you guys are individual condition"');
        socket.emit('ok individual condition sounds good');
    });

    socket.on('a_competitive_trial_completed', function (data) {
        let my_box_x = Math.ceil((game.scene.keys.SceneDemoGroup.player.x - field_x_floor)/cell_size_x)
        let my_box_y = Math.ceil((game.scene.keys.SceneDemoGroup.player.y - field_y_floor)/cell_size_y)
        let my_option = (my_box_x + num_cell * (my_box_y-1));
        // console.log(data.socialFreq);
        play_arm_competitive(my_box_x
            , my_box_y
            , num_cell
            , optionOrder
            , game.scene.keys.SceneDemoGroup
            , data.this_trial_num //currentTrial
            , condition
            , data.socialFreq[my_option - 1]
            // , game.scene.keys.SceneDemoGroup.social_frequency[my_option - 1]
        ); 
        currentTrial++;
        // totalEarning += payoff;
        isChoiceMade = false; // reset isChoiceMade counter 
        $("#totalEarningInCent").val(Math.round((totalEarning*cent_per_point)));
        $("#totalEarningInUSD").val(Math.round((totalEarning*cent_per_point))/100);
        $("#currentTrial").val(currentTrial);
        $("#exp_condition").val(exp_condition);
        //$("#confirmationID").val(confirmationID);
        $("#bonus_for_waiting").val(Math.round(waitingBonus));
        // payoffText.destroy();
        // waitOthersText.destroy();
        // for (let i =1; i<numOptions+1; i++) {
        // 	objects_feedbackStage['box'+i].destroy();
        // }
       
        if (currentTrial <= horizon) {
            setTimeout(function(){
                wake_main_stage_up(game, indivOrGroup);
            }, 1.8 * 1000);
        } 
        //else {
        //     socket.emit('completed all trial in the competitive task')
        // }
        // console.log('play_arm is fired with ' + game.scene.keys.SceneDemoGroup.social_frequency[my_option - 1] )
    })

    socket.on('all passed the test', function(data) {
        //console.log('testPassed reached ' + data.testPassed + ' conditoin: ' + data.exp_condition);
        game.scene.sleep('SceneWaitingRoom');
        game.scene.sleep('SceneWaitingRoom2');
        game.scene.start('SceneStartCountdown');
    });

    socket.on('client disconnected', function(data) {
        console.log('client disconnected. subjectNumber = ' + data.disconnectedSubjectNumber + ' left the room');
        other_player_visibility_array[data.disconnectedSubjectNumber - 1] = false;
        if (typeof other_player_array[data.disconnectedSubjectNumber - 1] != 'undefined') {
            other_player_array[data.disconnectedSubjectNumber - 1].visible = false;
        }
        currentGroupSize = data.roomStatus['n']
    });

    socket.on('these are done subjects', function(data) {
        doneSubject = data.doneSubject;
        //console.log('doneSubject is ' + doneSubject);
    });

    socket.on('Proceed to next round', function(data) {

        console.log('proceed to next round is called')

        currentTrial++;
        // totalEarning += payoff;
        isChoiceMade = false; // reset isChoiceMade counter 
        $("#totalEarningInCent").val(Math.round((totalEarning*cent_per_point)));
        $("#totalEarningInUSD").val(Math.round((totalEarning*cent_per_point))/100);
        $("#currentTrial").val(currentTrial);
        $("#exp_condition").val(exp_condition);
        //$("#confirmationID").val(confirmationID);
        $("#bonus_for_waiting").val(Math.round(waitingBonus));
        // payoffText.destroy();
        // waitOthersText.destroy();
        // for (let i =1; i<numOptions+1; i++) {
        // 	objects_feedbackStage['box'+i].destroy();
        // }
    	wake_main_stage_up(game, indivOrGroup);
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

    // --- When receiving 'avatar_position_update' from the server ----
    socket.on('avatar_position_update', function (data) {
        // console.log('Subject ' + data.subjectNumber + ' moves to x = ' + data.x + ' and y = ' + data.y);
        let new_target = new Phaser.Math.Vector2(); 
        // let x_jitter = Phaser.Math.Between(-cell_size_x/3, cell_size_x/3);
        // let y_jitter = Phaser.Math.Between(-cell_size_x/3, cell_size_y/3);
        // new_target.x = data.x + x_jitter;
        // new_target.y = data.y + y_jitter;
        new_target.x = data.x - cell_size_x/3 + jitter_position_array[data.subjectNumber -1].x
        new_target.y = data.y - cell_size_y/3 + jitter_position_array[data.subjectNumber -1].y
        // console.log(data.x + ' and ' + data.y);
        // console.log(new_target);
        others_target_array[data.subjectNumber - 1] = new_target;
        // Move at 200 px/s:
        game.scene.keys.SceneDemoGroup.physics.moveToObject(other_player_array[data.subjectNumber - 1], new_target, 700);
    });

    socket.on('show_chart', function (data) {
        game.scene.start('SceneResult');
        game.scene.stop('SceneFeedback');

        const ctx = window.document.getElementById('myChart'); // myChart
        let data_contents = [];
        let csv_contents = [];
        
         //<button onclick="csvDownload()">Download results</button>
        // let data_contents = [{
        //     label: 'Your choices',
        //     data: myChoices,
        //     borderColor: 'rgba(255, 100, 100, 0.9)',
        //     lineTension: 0,
        //     fill: false,
        //     borderWidth: 3
        // }];

        for (let i = 0; i < currentGroupSize; i++) {
            let others_choices = [];
            let others_payoffs = [];
            for (let t = 0; t < horizon; t++) {
                others_choices.push(data.socialInfo[t][i])
                others_payoffs.push(data.publicInfo[t][i])
                // data for csv saving
                if (i+1 != subjectNumber) {
                    csv_contents.push({
                        id: i+1, 
                        trial: t+1, 
                        choice: data.socialInfo[t][i],
                        payoff: data.publicInfo[t][i],
                        date: data.date[t][i],
                        time: data.time[t][i],
                        timeSec: data.timeSec[t][i]
                    });
                } else {
                    csv_contents.push({
                        id: 'myself', // 
                        trial: t+1, // 
                        choice: data.socialInfo[t][i],
                        payoff: data.publicInfo[t][i],
                        date: data.date[t][i],
                        time: data.time[t][i],
                        timeSec: data.timeSec[t][i]
                    });
                }
            }
            if (i+1 != subjectNumber) {
                data_contents.push({
                    // label: 'subject ' + (i+1) + '\'s choices',
                    label: '',
                    data: others_choices,
                    borderColor: 'rgba(147, 147, 147, 0.3)',
                    lineTension: 0,
                    fill: false,
                    borderWidth: 1
                });
            } else {
                data_contents.push({
                    label: 'Your choices',
                    data: others_choices,
                    borderColor: 'rgba(255, 100, 100, 0.9)',
                    lineTension: 0,
                    fill: false,
                    borderWidth: 3
                });
            }
            if (i == currentGroupSize-1) {
                // let donwloadButton = document.createElement("div");
                // donwloadButton.innerHTML = '<button onclick="csvDownload(csv_contents)">Download results</button>';
                const currentDiv = document.getElementById("download");
                currentDiv.innerHTML = '<div class="btn2" id="downloadButton" style="left: 50%;">Download results</fiv>';
                const downloadButton = document.getElementById("downloadButton");
                downloadButton.addEventListener('click', () => { csvDownload(csv_contents) }, false);
                // document.body.insertBefore(donwloadButton, currentDiv);
            }
        }

        const myChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: Array.from({length: horizon}, (_, i) => i + 1), // [1,2,3,...,horizon]
                datasets: data_contents
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true,
                        max: num_cell * num_cell + 0.2,
                        title: {
                            display: true,
                            text: 'Ranking of choices'
                        }
                    },
                    x : {
                        title: {
                            display: true,
                            text: 'Trial'
                        }
                    }
                },
                plugins: {
                    legend: {
                        //onClick: newLegendClickHandler
                        display: false
                    }
                }
            }
        });

        console.log(csv_contents);        

    });

    

} // window.onload -- end
