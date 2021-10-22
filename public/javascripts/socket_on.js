'use strict';

// I think this ping-pong monitoring is out-of-date; review needed. Discarded in the future
socket.on('pong', function (ms) {
        console.log(`socket :: averageLatency :: ${averageLatency} ms`);
        averageLatency.push(ms);
        averageLatency.splice(0,1);
});
