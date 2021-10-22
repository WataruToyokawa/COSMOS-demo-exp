'use strict';

// === Socket.io ====
const portnumQuestionnaire = 8000
	// , htmlServer = 'http://192.168.33.10:' // vagrant server (for debug)
	, htmlServer = 'http://63-250-60-135.cloud-xip.io:' //ipaddress 63.250.60.135
	, exceptions = ['INHOUSETEST3', 'wataruDebug', 'wataruDebug']
	, socket = io.connect(htmlServer+portnum, { query: 'amazonID='+amazonID }) // portnum is defined in game;ejs
;

// ==== Basic parameters ====
const configWidth = 768 //800
	, configHeight = 768 // 600
	, fieldWidth = configWidth * 0.75
	, fieldHeight = configHeight * 0.75
	, num_cell = 8
	, cell_size_x = fieldWidth / num_cell
	, cell_size_y = fieldHeight / num_cell
	, optionWidth = 150
	, optionHeight = 150
	, maxLatencyForGroupCondition = 1500
	, noteColor = '#ff5a00' // red-ish
	, nomalTextColor = '#000000' // black
;

// ==== Variables that change during the task =====
let isEnvironmentReady = false
	, isPreloadDone = false
	, isWaitingRoomStarted = false
	, myChoices = []
	, myEarnings = []
	, payoff
	, payoffTransformed
	, totalEarning = 0
	, cent_per_point = 2/100 // 1 cent per 100 points
	, browserHiddenPermittedTime = 10 * 1000
	, sessionName
	, roomName
	, subjectNumber
	, indivOrGroup
	, exp_condition
	, riskDistributionId
	, optionOrder
	, maxChoiceStageTime
	, currentTrial = 1
	, choiceOrder
	, currentChoiceFlag = 0
	, waitingBonus = 0
	, confirmationID = 'browser-reloaded'
	, maxGroupSize
	, maxWaitingTime
	, horizon = 0
	, myRoom
	, startTime
	, doneSubject
	, pointCentConversionRate = 0
	, completed = 0
	, waitingRoomFinishedFlag = 0
	, understandingCheckStarted = 0
	, averageLatency = [0,0]
	, submittedLatency = -1
	, mySocialInfoList = {option1:0, option2:0, option3:0, option4:0}
	, mySocialInfo
	, myPublicInfo
	, myLastChoice
	, myLastChoiceFlag
	, emitting_time = 0
	, restTime
	, waitingBox
	, waitingBar
	, waitingCountdown
	, bonusBar
	, bonusBox
	, countdownText
	, bonusText
;

// let config = {
// 	type: Phaser.AUTO, // Phaser.CANVAS, Phaser.WEBGL, or Phaser.AUTO
// 	width: configWidth,
// 	height: configHeight,
// 	physics: {
// 		default: 'arcade',
// 		arcade: {
// 			gravity: { y: 0 },
// 			debug: false
// 		}
// 	},
// 	parent: 'phaser-game-main',
// 	scale: {
// 		_mode: Phaser.Scale.FIT,
// 		parent: 'phaser-game-main',
// 		autoCenter: Phaser.Scale.CENTER_BOTH,
// 		width: configWidth,
// 		height: configHeight
// 	},
// 	dom: {
// 		createContainer: true
// 	},
// 	scene:
// 	[ SceneWaitingRoom0
// 	, SceneWaitingRoom
// 	, SceneWaitingRoom2
// 	, SceneDebugEnv
// 	, sceneDebugPopup
// 	, ScenePerfect
// 	, SceneStartCountdown
// 	, SceneMain
// 	]
// };

// let game = new Phaser.Game(config);
