const fs = require('fs');
const ws = require('ws');
const http = require('http');
const express = require('express');

const app = express();
let websockets = {};

app.get('/', (req, res) => {
    res.json({
        message: 'yuppppppp'
    });
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
    conn.on('message', (message) => {
        if (message !== 'keepalive') {
            console.log(message);
            wss.clients.forEach(client => {
                if (client !== conn) {
                    console.log(`sending ${message} to client`);
                    client.send(message);
                }
            });
        }
    });
});
