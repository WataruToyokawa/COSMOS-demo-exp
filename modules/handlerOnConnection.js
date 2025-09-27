'use strict';
// './modules/handlerOnConnection'

const { createRoom } = require('../utils/roomFactory'); 
const { addSubject } = require('../utils/helpers'); 

/**
 * Handle 'core is ready'
 * @param {Object} config - game env parameters
 * @param {Object} client - the Socket.IO client socket
 * @param {Object} io
 */

function onConnectioncConfig({ config, client, io }) {

  // Assign client's unique identifier
	client.subjectID = client.request?._query.subjectID;
    client.condition = client.request?._query.condition;
	client.started = 0;

    // check sessionName already assigned
	const incomingSessionName = client.request?._query.sessionName;

	// Case 1: First-time connection (no sessionName provided)
    if (typeof incomingSessionName === 'undefined') {
        client.session = client.id; // assign new session
        client.join(client.session);
        config.sessionNameSpace[client.session] = 1;
        console.log(`- Exp. ID ${client.session} assigned to ${client.subjectID}`);

    // Case 2: Reconnection from a completed session
    } else if (incomingSessionName === 'already_finished') {
        client.session = incomingSessionName;
        client.room = 'decoyRoom';
        client.join(client.session);
        client.join(client.room);
        console.log(' - Session marked as already finished; decoyRoom assigned');

    // Case 3: Unexpected reconnection from a known session (e.g., browser auto-reconnect)
    // // When client comes back from a short disconnection
    } else {
        client.session = incomingSessionName;
        client.room = client.request?._query.roomName; //'decoyRoom';
        client.join(client.session);
        client.join(client.room);

        // Notify client they've been sent to decoyRoom
        io.to(client.session).emit('S_to_C_welcomeback', {
            sessionName: client.session,
            roomName: client.room
        });

        // Mark the original session as already handled
        config.sessionNameSpace[incomingSessionName] = 1;

        if(typeof config.roomStatus[client.room] === 'undefined'){
            // make a new room
            config.roomStatus[client.room] = createRoom({ name: client.room });
            // then add this subject to the new room
            addSubject(config, client);
        } else if (config.roomStatus[client.room]['starting'] > 0) {
            // Unfortunately, the room originally assigned 
            // has already been started.
            // So this returned subect should be sent to the indiv condition
            io.to(client.session).emit('you guys are individual condition');
        } else {
            // if everything looks ok, let this subject come back
            addSubject(config, client);
            
        }

        // Log the reconnection
        console.log(` - ${incomingSessionName} (${client.subjectID}) in room ${client.request._query.roomName} reconnected`);
        console.log(` - room ${client.request._query.roomName} has ${config.roomStatus[client.room]['n']} with total N = ${config.total_N_nowRef.value}`);
    }

}

module.exports = { onConnectioncConfig };
