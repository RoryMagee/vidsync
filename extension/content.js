let ws;
let video;

chrome.runtime.onMessage.addListener((request, sender, response) => {
    switch(request) {
        case 'join':
            // Connect to websocket server
            console.log('joining session');
            joinSession();
            break;
        case 'leave':
            // Disconnect from websocket server
            leaveSession();
            console.log('leaving session');
            break;
        case 'checkConnection':
            // Check if websocket is connected
            console.log('checking if websocket is connected');
            response(isSocketConnected());
            break;
        default:
            // Command not found
            console.log('request handler not found');
            break;
    }
});

function joinSession() {
    console.log('joining session');
    if (!isSocketConnected()) {
        // Socket is not connected so we can attempt to connect
        getVideo();
        ws = new WebSocket(websocketAddress());
        ws.onmessage = (message) => {
            let parsed = JSON.parse(message.data);
            switch (parsed['operation']) {
                case 'playpause':
                    if (parsed['value'] === 'play') {
                        video.play();
                    } else {
                        video.pause();
                    }
                    break;
                case 'seek':
                    video.currentTime = parseInt(parsed['value']);
                default:
                    console.log('wtfffff\n', parsed['operation']);
                    break;
            }
        }
        ws.onclose = () => {
            console.log('Websocket disconnected');
        }
        console.log('Connection successfully established');
    }
}

function leaveSession() {
    if (isSocketConnected()) {
        ws.close();
        ws = undefined;
    }
}

function getVideo() {
    video = document.querySelector('video[src]');
    if (video) {
        video.onplay = () => {
            console.log('playing the video');
            ws.send(JSON.stringify({
                operation: 'playpause',
                value: 'play'
            }));
        }
        video.onpause = () => {
            console.log('pausing the video');
            ws.send(JSON.stringify({
                operation: 'playpause',
                value: 'pause'
            }));
        }
        /*
         * We want it so that if we seek from the video player we emit the 
         * timstamp to the server. If the event comes from a command in the 
         * script then we don't want to emit anything. 
         * 
         * When we seek we want to remove the event listener and then add it 
         * back after we are done seeking
         */
        video.onseeked = (event) => {
            console.log('seeking');
            ws.send(JSON.stringify({
                operation: 'seek',
                value: event['target']['currentTime']
            }));
        }
    } else {
        console.error('Video not found in website');
    }
}

function isSocketConnected() {
    if (ws?.readyState === 1) {
        return true;
    } else {
        return false;
    }
}

window.setInterval(() => {
    if (isSocketConnected()) {
        ws.send('keepalive');
    }
}, 20000);
