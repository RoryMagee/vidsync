let ws;
let video;

chrome.runtime.onMessage.addListener((request, sender, response) => {
    switch(request) {
        case 'join':
            // Connect to websocket server
            joinSession();
            break;
        case 'leave':
            // Disconnect from websocket server
            leaveSession();
            break;
        case 'checkConnection':
            // Check if websocket is connected
            response(isSocketConnected());
            break;
        default:
            // Command not found
            console.log('request handler not found');
            break;
    }
});

function joinSession() {
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
                    video.onseeked = null;
                    video.currentTime = parseInt(parsed['value']);
                default:
                    console.log('wtfffff\n', parsed['operation']);
                    break;
            }
        }
        ws.onclose = () => {
            console.log('Websocket disconnected');
        }
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
            ws.send(JSON.stringify({
                operation: 'playpause',
                value: 'play'
            }));
        }
        video.onpause = () => {
            ws.send(JSON.stringify({
                operation: 'playpause',
                value: 'pause'
            }));
        }
        /*
         * When seek message is received - we remove the event listener from
         * the video then update the video time and then we add the event 
         * listner back
         */
        video.oncanplay = (event) => {
            video.onseeked = (event) => {
                event.stopPropagation();
                event.preventDefault();
                ws.send(JSON.stringify({
                    operation: 'seek',
                    value: event['target']['currentTime']
                }));
            }
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
