'use strict';

// ==== Variables that change during the task =====
let isEnvironmentReady = false
	, isPreloadDone = false
	, isWaitingRoomStarted = false
	, myChoices = []
	, myEarnings = []
	, other_player_array = []
	, other_player_visibility_array = []
	, others_target_array = []
	, payoff
	, payoffTransformed
	, totalEarning = 0
	, cent_per_point = 2/100 // 1 cent per 100 points
	, browserHiddenPermittedTime = 10 * 1000
	, sessionName
	, roomName
	, subjectNumber
	, indivOrGroup
	, currentGroupSize = 0
	, exp_condition
	, isChoiceMade = false
	, needATimer = true
	, needAFeedback = true
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

let trialText_Y = 16
	,	scoreText_Y = 66
	,	energyBar_Y = 116
;