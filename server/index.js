const fs = require('fs');
const ws = require('ws');
const http = require('http');
const express = require('express');

const app = express();

app.get('/', (req, res) => {
    res.send("<h1>👀</h1>");
});

const httpServer = http.createServer(app);
httpServer.listen(3000, () => {
    console.log('listening on port 3000');
});

const wss = new ws.Server({
    server: httpServer
});

wss.on('connection', (conn) => {
    console.log('client connected');
    console.log(`${wss.clients.size} clients connected`);
    conn.on('message', (message) => {
        if (message !== 'keepalive' && client !== conn && client.readyState === Websocket.OPEN) {
            console.log(message);
            let parsed = JSON.parse(message);
            switch(parsed['operation']) {
                case 'playpause':
                    client.send(JSON.stringify({
                        operation: 'playpause',
                        value: parsed['value']
                    }));
                    break;
                case 'seek':
                    client.send(JSON.stringify({
                        operation: 'seek',
                        value: parsed['value']
                    }));
                    break;
                case 'disconnect':
                    client.disconnect();
                    break;
                default:
                    console.log(message);
                    console.log('No handler found');
            }
        }
    });
});
