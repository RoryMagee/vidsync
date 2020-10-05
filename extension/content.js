let ws;
let video;

/*
 * Handle messages being send to content script from the script in the popup
 */
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

/*
 * Initialise the websocket connection and set up the handling for what the
 * extension should do when certain messages are received.
 */
function joinSession() {
    if (!isSocketConnected()) {
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

/*
 * Close websocket connection
 */
function leaveSession() {
    if (isSocketConnected()) {
        ws.close();
        ws = undefined;
    }
}

/*
 * Retrieves the video element from the page and updates the event handlers
 * to send websocket requests when given actions happen
 * play -> send play message over socket
 * pause -> send pause message over socket
 * seek -> send new timetamp over socket
 */
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

/*
 * Check if socket connection exists. If it does - return true, otherwise,
 * return false
 */
function isSocketConnected() {
    if (ws?.readyState === 1) {
        return true;
    } else {
        return false;
    }
}

/*
 * Establish an interval function to send keepalive messages over the 
 * websocket connection - otherwise the connection will be closed by the 
 * server
 */
window.setInterval(() => {
    if (isSocketConnected()) {
        ws.send('keepalive');
    }
}, 20000);
