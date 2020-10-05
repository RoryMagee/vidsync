const fs = require('fs');
const ws = require('ws');
const http = require('http');
const express = require('express');

const app = express();

app.get('/', (req, res) => {
    res.send("<h1>👀</h1>");
});

// Create server and listen on port 3000
const httpServer = http.createServer(app);
httpServer.listen(3000, () => {
    console.log('listening on port 3000');
});

// Create a websocket server from the HTTP server created above
const wss = new ws.Server({
    server: httpServer
});

// Create handling for receiving websocket message
wss.on('connection', (conn) => {
    console.log('client connected');
    console.log(`${wss.clients.size} clients connected`);
    conn.on('message', (message) => {
        // If the message is a keepalive message then we can ignore it
        if (message !== 'keepalive') {
            wss.clients.forEach(client => {
                if (client !== conn && client.readyState === ws.OPEN) {
                    websocketHandler(message, client);
                } else {
                    console.log('not sending message to client\n', message);
                }
            });
        }
    });
});

function websocketHandler(message, client) {
    let parsed = JSON.parse(message);
    switch(parsed['operation']) {
        case 'playpause':
            emitValue('playPause', parsed['value'], client);
            break;
        case 'seek':
            emitValue('seek', parsed['value'], client);
            break;
        case 'disconnect':
            client.disconnect();
            break;
        default:
            console.log(`No handler found for ${message}`);
    }
}

function emitValue(operation, value, client) {
    client.send(JSON.stringify({
        operation: operation,
        value: value
    }));
}
