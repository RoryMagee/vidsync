chrome.runtime.onMessage.addListener((request, sender, response) => {
    switch(request) {
        case 'join':
            // Connect to websocket server
            console.log('joining session');
            break;
        case 'leave':
            // Disconnect from websocket server
            console.log('leaving session');
            break;
        default:
            console.log('request handler not found');
            break;
    }
});
