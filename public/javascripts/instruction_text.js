'use strict';

//const instructionText = require('./instructionText');
const waitingRoomText0 = 
	[ 'Welcome!'
	, 'The task will start shortly.'
	// , 'If nothing happens and you seem getting stuck in this page for more than 15 seconds, please reload this page.'
	, 'Make sure you have a stable internet connection.'
	, ''
	//, 'The study starts in ' + '???' + ' sec.'
	];
const waitingRoomText = 
	[ 'Waiting Room'
	, 'Please do not reload this page or open a new browser window.'
	, 'Also please do not hide this browser window by other tab or apps.'
	, 'If you do so, the task will be terminated automatically.'
	, ''
	//, 'The study starts in ' + '???' + ' sec.'
	];
const waitingForOthers = 
	[ 'Wait for others'
	, 'Please do not reload this page or open a new browser window.'
	, 'Also please do not hide this browser window by other tab or apps.'
	, 'If you do so, the task will be terminated automatically.'
	, 'Your waiting bonus is ' + '???' + ' cents.'
	];
const instructionText_indiv = 
	[ 'Please read the following instructions carefully. After reading the instructions, we will ask a few questions to verify your understanding of the experimental task.'

	, '<br><br>Throughout the main task, you are to make a series of choices between 2&nbsp;slot machines.'

	, '<br><br>Overall, there will be <span class="note">70&nbsp;trials</span>. On <span class="note">each trial</span>, you are to make <span class="note">1&nbsp;choice</span>.'

	, '<br><br>Each choice will earn you a reward. Your total payout will be based on <span class="note">the sum of all points</span> you earn over the 70&nbsp;trials.'

	, '<br><br>The total reward you get will be converted into real money. The exchange rate is <span class="note">100&nbsp;points = 2&nbsp;pence.</span>'
	// , '<br><br>The total reward you get will be converted into real money. The exchange rate is <span class="note">500&nbsp;points = 10&nbsp;pence.</span>'

	, '<br>The reward for each slot seems random, but <span class="note">some of the slots will generate a higher payoff on average than the other</span>. The average payoff of each slot is constant over the long run (i.e., does not vary throughout the game).'

	, '<br><br><br><br>On the next page, you will play a tutorial to get familiar with the task!'
	];
const tutorialText_indiv = 
	[ '<br>This is the tutorial task. <br><br>Start by choosing whichever slot machine you like!'

	, '<br><br>You got 30 points! Well done.'

	, '<br>This is the second trial. The <span class="note">same slot machines</span> will appear again. <br><br>Please make another choice!'

	, '<br><br>Hooray! You got 50 points!'

	, 'You have <span class="note">up to 15 seconds</span> in making a choice. Let\'s see what happens if time is up.<br><br>Note: You cannot click any options here for the tutorial purpose.'

	, '<br><br>Time was up and you missed the trial! So you got nothing.'

	, '<br>The tutorial is done. <br><br>Next, you will proceed to a short comprehension quiz!'
	];
const understandingCheckText_indiv = 
	[ '<h3>Please answer the following questions.</h3>'

	, 'How many trials will you play in total?' // 70

	, 'Is it possible to choose the same option repeatedly?' //YES

	, 'Does your bonus of this task increase by getting more reward points from the task?' //YES
	];

const instructionText_group = 
	[ 'Please read the following instructions carefully. After reading the instructions, we will ask a few questions to verify your understanding of the experimental task. <br><br>After answering these questions, you may spend some more time in a waiting room until sufficient number of participants have arrived to start the task. <br><br>You will be paid <span class="note">10 pence per minute</span> (that is, $6 per hour) for any time spent in the waiting room. When your group is ready, the main task will start.'

	, '<br><br>Throughout the main task, you are to make a series of choices between 2&nbsp;slot machines.'

	, '<br><br>Overall, there will be <span class="note">70&nbsp;trials</span>. On <span class="note">each trial</span>, you are to make <span class="note">1&nbsp;choice</span>.'

	, '<br><br>Each choice will earn you a reward. Your total payout will be based on <span class="note">the sum of all points</span> you earn over the 70&nbsp;trials.'

	, '<br><br>The total reward you get will be converted into real money. The exchange rate is <span class="note">100&nbsp;points = 2&nbsp;pence</span>'
	// , '<br><br>The total reward you get will be converted into real money. The exchange rate is <span class="note">500&nbsp;points = 10&nbsp;pence.</span>'

	, '<br>The reward for each slot seems random, but <span class="note">some of the slots will generate a higher payoff on average than the other</span>. The average payoff of each slot is constant over the long run (i.e., does not vary throughout the game).'

	, '<br><br>Other people will participate in this online experiment at the same time with you.'

	// , '<br>You will see the <span class="note">number of people (including yourself)</span> choosing each slot. <br><br>The example below shows that 4 people chose the left and other 6 chose the right in the preceding trial.'
	, '<br>You will see the <span class="note">number of people (including yourself)</span> choosing each slot.'

	, '<br>Note: this <span class="note">"number of people" does not affect the amount of your reward</span>. The reward points are provided <span class="note">independently</span> from other people\'s choices.'

	, '<br>Nevertheless, other people\'s choice may be worth checking because you all will be playing the same task. It may give you a hint for finding the better one between the slots.'

	, '<br><br><br><br>On the next page, you will play a tutorial to get familiar with the task!'
	];
const tutorialText_group = 
	[ '<br>This is the tutorial task. <br><br>Start by choosing whichever slot machine you like!'

	, '<br><br>You got 30 points! Well done.'

	, '<br>This is the second trial. The <span class="note">same slot machines</span> will appear again. <br><br>Please make another choice!'

	, '<br><br>Hooray! You got 50 points!'

	, 'You have <span class="note">up to 15 seconds</span> in making a choice. Let\'s see what happens if time is up.<br><br>Note: You cannot click any options here for the tutorial purpose.'

	, '<br><br>Time was up and you missed the trial! So you got nothing.'

	, '<br>The tutorial is done. <br><br>Next, you will proceed to a short comprehension quiz!'
	];
const understandingCheckText_group = 
	[ '<h3>Please answer the following questions.</h3>'

	, 'How many trials will you and the other players play in total?' // 70

	, 'Is it possible to choose the same option repeatedly?' //YES

	, 'Does your bonus of this task increase by getting more reward points from the task?' //YES

	, 'Do other workers play the same task as yours?' //YES

	, 'Does your reward points change by how many players are choosing your option?' //NO
	];

const revisitingInstructionText = 
	[ '<br><br><span class="note">Woops! One or more answers were incorrect.</span> Please read the instruction again!'

	, '<br><br>That\'s it! Take the comprehension quiz again in the next page.'
	]

const goToQuestionnaireText = 
	[ 'Well done!'
	, 'Your total game reward: £'
	, 'Waiting bonus: £'
	, 'Flat fee for completion of the task: £'
	];
// experimental variables (negatively skewed)
//["risky", "risky", "risky", "sure", "risky", "risky", "risky", "sure", "sure", "risky", "sure", "risky", "risky", "risky", "risky", "risky", "risky", "risky", "risky", "risky", "risky", "risky", "risky", "risky", "risky", "risky", "risky", "risky", "risky", "risky", "risky", "sure", "sure", "sure", "risky", "risky", "sure", "sure", "sure", "sure", "sure", "risky", "risky", "sure", "sure", "sure", "sure", "sure", "sure", "risky", "risky", "risky", "risky", "risky", "risky", "risky", "sure", "sure", "sure", "sure", "sure", "sure", "sure", "sure", "sure", "sure", "sure", "sure", "sure", "risky", "risky", "risky", "sure", "sure", "sure", "sure", "sure", "sure", "sure", "sure", "sure", "sure", "sure", "risky", "risky", "risky", "risky", "risky", "risky", "risky", "sure", "sure", "sure", "sure", "sure", "sure", "sure", "sure", "sure", "sure"]
