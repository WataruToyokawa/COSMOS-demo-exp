'use strict';
// modules/paramEmitter.js

function emitParameters(io, client, config) {
	const room = config.roomStatus[client.room];
	const { taskOrder } = room;

	// room.horizon = taskOrder[0] === 'static'
	// 	? config.horizonList[0]
	// 	: config.horizonList[1];
	room.horizon = config.horizon;

	const payload = {
		id: client.session,
		room: client.room,
		maxChoiceStageTime: config.maxChoiceStageTime,
		maxTimeTestScene: config.maxTimeTestScene,
		exp_condition: room.exp_condition,
		info_share_cost: room.info_share_cost,
		horizon: room.horizon,
		subjectNumber: client.subjectNumber,
		indivOrGroup: room.indivOrGroup,
		numOptions: config.numOptions,
		optionOrder: room.optionOrder,
		taskOrder,
		gameRound: room.gameRound,
		changes: config.changes,
		environments: [config.prob_0, config.prob_1, config.prob_2, config.prob_3, config.prob_4]
	};

	io.to(client.session).emit('this_is_your_parameters', payload);
	console.log(` - parameters sent to ${client.session} (room ${client.room}) with taskOrder = ${taskOrder}`);
}

module.exports = { emitParameters };
