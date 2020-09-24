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

//TODO: Add onmessage handler for websocket
function joinSession() {
    console.log('joining session');
    if (!isSocketConnected()) {
        // Socket is not connected so we can attempt to connect
        ws = new WebSocket(websocketAddress());
        setConnectionStatus(true);
        getVideo();
        console.log('Connection successfully established');
    }
}

function leaveSession() {
    if (isSocketConnected()) {
        // Socket is connected
        ws.close();
    }
}

function getVideo() {
    video = document.querySelector('video[src]');
    if (video) {
        video.onplay = () => {
            ws.send('play');
        }
        video.onpause = () => {
            ws.send('pause');
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

function setConnectionStatus(isConnected) {
    chrome.storage.local.set({websocketConnected: isConnected});
}

function getConnectionStatus() {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get('websocketConnected', (res) => {
            if (res.hasOwnProperty('websocketConnected')) {
                resolve(res['websocketConnected']);
            } else {
                reject('value not found');
            }
        });
    });
}
